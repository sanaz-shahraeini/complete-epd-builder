"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import { useUserStore } from "@/lib/store/user"
import { useUsers } from "@/lib/context/UsersContext"
import { type UserProfile } from "@/lib/api/auth"
import { useState, useEffect, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Image, Info } from 'lucide-react'
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { ProductComparison as ProductComparisonComponent } from "@/app/components/comparison/ProductComparison"
import { API_ROUTES, buildApiUrl } from "@/lib/api/config";

interface Product {
  id: string;
  name: string;
  industry: string;
  country: string;
  description: string;
  verificationYear: string;
}

interface IbuData {
  uuid: string
  name: string
  version: string
  geo: string
  latitude?: number
  longitude?: number
  classific: string
  classific_system: string
  type: string
  pdf_url: string | null
  ref_year: string
  valid_until: number
  owner: string
  sub_type: string
  reg_no: string
  node_id: string
  ds_type: string
  created_at: string
  updated_at: string
  languages: Record<string, any>
  status?: 'verified' | 'pending' | null
  // Core Environmental Impact
  gwp?: string  // Global Warming Potential
  odp?: string  // Ozone Depletion
  ap?: string   // Acidification
  ep?: string   // Eutrophication
  // Resource Use
  renewable_energy?: string
  nonrenewable_energy?: string
  water_usage?: string
  waste?: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: IbuData[]
}

// const mockProducts: Product[] = [
//   {
//     id: "123456789",
//     name: "Product name 01",
//     industry: "Industry Solutions",
//     country: "Spain",
//     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
//     verificationYear: "2024"
//   },
//   {
//     id: "123456789",
//     name: "Product name 02",
//     industry: "Industry Solutions",
//     country: "Spain",
//     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
//     verificationYear: "2024"
//   },
//   // Add more mock products as needed
// ];

const PAGE_SIZE = 9;

export default function EPDPage() {
  const t = useTranslations('EPD');
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const user = useUserStore((state) => state.user)
  const { users } = useUsers()
  const [ibuData, setIbuData] = useState<IbuData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [allProducts, setAllProducts] = useState<IbuData[]>([]);

  // State for unique values
  const [uniqueClassifications, setUniqueClassifications] = useState<string[]>([]);
  const [uniqueYears, setUniqueYears] = useState<number[]>([]);
  const [industrySolutions, setIndustrySolutions] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<string[]>([]);

  // Get unique values for select boxes
  const getUniqueValues = async () => {
    try {
      const response = await fetch(
        buildApiUrl(`${API_ROUTES.PRODUCTS.IBU_DATA}/`)
      );
      const data = await response.json();
      
      // Get unique classifications
      const classificationSet = new Set(data.results.map((item: IbuData) => item.classific));
      const classifications = Array.from(classificationSet)
        .filter(Boolean)
        .sort() as string[];
      setUniqueClassifications(classifications);

      // Get unique years
      const yearsSet = new Set(
        data.results.map((item: IbuData) => parseInt(item.ref_year))
      );
      const years = Array.from(yearsSet)
        .filter((year): year is number => typeof year === 'number' && !isNaN(year))
        .sort((a, b) => b - a);
      setUniqueYears(years);
    } catch (error) {
      console.error('Error fetching unique values:', error);
      setUniqueClassifications([]);
      setUniqueYears([]);
    }
  };

  // Fetch industry solutions and classifications
  const fetchFilterOptions = async () => {
    try {
      const url = buildApiUrl('/api/ibudata-full');
      console.log('Fetching filter options from:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Filter options response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch filter options');
      }

      const data = await response.json();
      console.log('Received filter options:', data);
      
      // Extract unique values from the results
      const industries = new Set<string>();
      const classificationSet = new Set<string>();
      const yearsSet = new Set<string>();

      data.results.forEach((item: any) => {
        if (item.industry_solution) industries.add(item.industry_solution);
        if (item.classific) classificationSet.add(item.classific);
        if (item.ref_year) yearsSet.add(item.ref_year);
      });

      setIndustrySolutions(Array.from(industries).sort());
      setClassifications(Array.from(classificationSet).sort());
      setUniqueYears(Array.from(yearsSet).map(year => parseInt(year)).sort((a, b) => b - a));
    } catch (error) {
      console.error('Error fetching filter options:', error);
      setIndustrySolutions([]);
      setClassifications([]);
      setUniqueYears([]);
    }
  };

  // Update classifications when industry solution changes
  const updateClassifications = async (industry: string) => {
    try {
      const queryParams = new URLSearchParams();
      if (industry && industry !== 'all') {
        queryParams.append('industry_solution', industry);
      }

      const url = buildApiUrl(`/api/ibudata?${queryParams}`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch classifications');

      const data = await response.json();
      const classificationSet = new Set<string>();
      
      data.results.forEach((item: any) => {
        if (item.classific) classificationSet.add(item.classific);
      });

      setClassifications(Array.from(classificationSet).sort());
      // Reset classification selection when industry changes
      setSelectedClassification('');
    } catch (error) {
      console.error('Error fetching classifications:', error);
      setClassifications([]);
      setSelectedClassification('');
    }
  };

  // Handle industry solution change
  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value === 'all' ? '' : value);
    updateClassifications(value);
    // Reset to first page when industry changes
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    // Reset to first page when any filter changes
    setCurrentPage(1);

    switch (filterType) {
      case 'classification':
        setSelectedClassification(value);
        break;
      case 'year':
        setSelectedYear(value);
        break;
      case 'user':
        setSelectedUser(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when search changes
    setCurrentPage(1);
  };

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch data when page or filters change
  useEffect(() => {
    if (session?.accessToken) {
      console.log('Filters changed, fetching new data with:', {
        search: debouncedSearchQuery,
        year: selectedYear,
        industry: selectedIndustry,
        classification: selectedClassification,
        status: selectedStatus,
        user: selectedUser,
        page: currentPage
      });
      fetchIbuData();
    }
  }, [debouncedSearchQuery, selectedYear, selectedIndustry, selectedClassification, selectedStatus, selectedUser, currentPage]);

  // Effect to fetch initial data
  useEffect(() => {
    if (session?.accessToken) {
      console.log('Session available, fetching initial data');
      fetchFilterOptions();
      fetchIbuData();
    }
  }, [session?.accessToken]);

  const fetchIbuData = async () => {
    setLoading(true);
    try {
      // If status is pending, return empty results since all items are verified
      if (selectedStatus === 'pending') {
        setIbuData([]);
        setTotalItems(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      
      // Add search and filters
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedYear) queryParams.append('ref_year', selectedYear);
      if (selectedIndustry && selectedIndustry !== 'all') queryParams.append('industry_solution', selectedIndustry);
      if (selectedClassification && selectedClassification !== 'all') queryParams.append('classific', selectedClassification);
      // Only add status filter if it's verified, since all items are verified
      if (selectedStatus === 'verified') queryParams.append('status', selectedStatus);
      if (selectedUser && selectedUser !== 'all') queryParams.append('user', selectedUser);
      
      // Add pagination
      queryParams.append('page', currentPage.toString());
      queryParams.append('page_size', PAGE_SIZE.toString());

      const url = buildApiUrl(`/api/ibudata-full/?${queryParams}`);
      console.log('Fetching IBU data from:', url);
      console.log('With filters:', {
        search: searchQuery,
        year: selectedYear,
        industry: selectedIndustry,
        classification: selectedClassification,
        status: selectedStatus,
        user: selectedUser,
        page: currentPage,
        pageSize: PAGE_SIZE
      });

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('IBU data response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('Received IBU data:', data);
      
      setIbuData(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching IBU data:', error);
      setIbuData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [isComparing, setIsComparing] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<IbuData[]>([])

  const handleCompareClick = () => {
    if (selectedForComparison.length >= 2) {
      setIsComparing(prev => !prev)
    }
  }

  const handleAddToComparison = (product: IbuData) => {
    if (selectedForComparison.length < 3) {
      setSelectedForComparison(prev => {
        if (prev.some(p => p.uuid === product.uuid)) {
          return prev.filter(p => p.uuid !== product.uuid)
        }
        return [...prev, product]
      })
    }
  }

  const handleRemoveFromComparison = (productId: string) => {
    setSelectedForComparison(prev => prev.filter(p => p.uuid !== productId))
    if (selectedForComparison.length <= 2) {
      setIsComparing(false)
    }
  }

  const handleAddProduct = () => {
    setIsComparing(false)
  }

  // Add state for page input
  const [pageInput, setPageInput] = useState<string>('');

  // Add handler for direct page navigation
  const handleDirectPageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handlePageChange(page);
      }
      setPageInput('');
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-4">
      {isComparing ? (
        <div className="bg-white rounded-lg p-6">
          <ProductComparisonComponent
            selectedProducts={selectedForComparison}
            onRemoveProduct={handleRemoveFromComparison}
            onAddProduct={handleAddProduct}
            selectedClassification={selectedClassification}
          />
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            {/* Filters Row - Now scrollable on mobile */}
            <ScrollArea className="w-full pb-4">
              <div className="flex flex-nowrap gap-2 md:gap-4 min-w-max px-2">
                {/* Classification Select */}
                <Select
                  value={selectedClassification}
                  onValueChange={(value) => handleFilterChange('classification', value)}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[200px] bg-white border border-gray-200 text-sm">
                    <SelectValue placeholder={t('filters.classification.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.classification.all')}</SelectItem>
                    {classifications.map(classification => (
                      <SelectItem key={classification} value={classification}>{classification}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Users Select */}
                <Select
                  value={selectedUser || 'all'}
                  onValueChange={(value) => handleFilterChange('user', value)}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[200px] bg-white border border-gray-200 text-sm">
                    <SelectValue placeholder={t('filters.users.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.users.all')}</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>{user.username || user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Select */}
                <Select
                  value={selectedYear || ''}
                  onValueChange={(value) => handleFilterChange('year', value)}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[200px] bg-white border border-gray-200 text-sm">
                    <SelectValue placeholder={t('filters.year.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Select */}
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[200px] bg-white border border-gray-200 text-sm">
                    <SelectValue placeholder={t('filters.status.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ScrollArea>

            {/* Search and Compare Row - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center px-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder={t('filters.search.placeholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-white border border-gray-200"
                />
              </div>
              <Button 
                className="px-6 w-full sm:w-1/3 bg-teal-600 hover:bg-teal-700 text-white text-sm lg:text-base"
                onClick={handleCompareClick}
                disabled={selectedForComparison.length < 2}
              >
                {t('comparison.button', { count: selectedForComparison.length })}
              </Button>
            </div>
          </div>

          {/* EPD Cards Grid - Adjust columns for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white border border-gray-200">
                  <div className="w-full h-[140px] bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-4">
                    <div className="h-6 bg-gray-100 animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                </Card>
              ))
            ) : ibuData.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {selectedStatus === 'pending' 
                    ? t('noResults.pending')
                    : t('noResults.filtered')}
                </p>
              </div>
            ) : (
              ibuData.map((item) => (
                <Card key={item.uuid} className="relative bg-white border border-gray-200 overflow-hidden">
                  {/* Selection Checkbox */}
                  <div className="absolute right-4 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedForComparison.some(p => p.uuid === item.uuid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAddToComparison(item)
                        } else {
                          handleRemoveFromComparison(item.uuid)
                        }
                      }}
                      disabled={selectedForComparison.length >= 3 && !selectedForComparison.some(p => p.uuid === item.uuid)}
                      className="h-5 w-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-teal-500"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-[140px] bg-[#E7F1F1] flex items-center justify-center">
                    <Image className="w-20 h-20 text-teal-500" />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium truncate" title={item.name} style={{ maxWidth: '200px' }}>
                          {item.name}
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info size={14} />
                        </button>
                      </div>
                      <div className="text-xs whitespace-nowrap">
                        <span className={`font-medium ${item.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {item.status === 'pending' ? 'Pending' : 'Verified'}
                        </span>
                        {" "}
                        <span>{item.ref_year}</span>
                      </div>
                    </div>

                    {/* Details List */}
                    <ul className="space-y-2">
                      <li key="industry" className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.industry')}</span>
                        <span className="ml-auto truncate text-xs text-gray-900" title={item.classific} style={{ maxWidth: '150px' }}>
                          {item.classific}
                        </span>
                      </li>
                      <li key="country" className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.country')}</span>
                        <span className="ml-auto text-xs text-gray-900">{item.geo}</span>
                      </li>
                      <li key="id" className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.id')}</span>
                        <span className="ml-auto px-2 py-0.5 rounded bg-[#E8F5E9] text-xs text-gray-900 font-mono">
                          {item.uuid ? item.uuid.slice(0, 8) : item.node_id?.slice(0, 8) || '-'}
                        </span>
                      </li>
                    </ul>

                    {item.pdf_url && (
                      <div className="pt-2">
                        <a 
                          href={item.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full text-xs text-teal-600 hover:text-teal-700 border border-teal-600 hover:border-teal-700 rounded-md py-1.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View PDF
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Modern Minimalist Pagination */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            {/* Results info */}
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Previous page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisible = 3; // Show only 3 pages for minimalist design
                  
                  let startPage = Math.max(1, currentPage - 1);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  // Adjust start if we're near the end
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  // First page if not in range
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key="1"
                        onClick={() => handlePageChange(1)}
                        className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots1" className="h-10 w-10 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  // Visible pages
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                          currentPage === i
                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Last page if not in range
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="dots2" className="h-10 w-10 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>

              {/* Next page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Last page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Jump to page - Only show for many pages */}
            {totalPages > 5 && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handleDirectPageChange}
                  className="w-16 h-10 rounded-lg border-gray-200 text-center text-sm focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Page"
                />
                <button
                  onClick={() => {
                    const page = parseInt(pageInput);
                    if (!isNaN(page) && page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                      setPageInput('');
                    }
                  }}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                >
                  Go
                </button>
              </div>
            )}
          </div>

          {/* Total Items Count */}
          {!loading && (
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 px-2">
              {t('pagination.showing', {
                start: Math.min(totalItems, ((currentPage - 1) * PAGE_SIZE) + 1),
                end: Math.min(currentPage * PAGE_SIZE, totalItems),
                total: totalItems
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ProductComparisonProps {
  selectedProducts: IbuData[];
  onRemoveProduct: (productId: string) => void;
  onAddProduct: () => void;
  selectedClassification: string;
}

function ProductComparison({
  selectedProducts,
  onRemoveProduct,
  onAddProduct,
  selectedClassification,
}: ProductComparisonProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium">Product Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {selectedProducts.map((product) => (
          <Card key={product.uuid} className="bg-white border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="w-full h-[140px] bg-[#E7F1F1] flex items-center justify-center">
              <Image className="w-20 h-20 text-teal-500" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium line-clamp-2 mb-1" title={product.name}>
                    {product.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4 text-sm shrink-0">
                  <span className="text-emerald-600 font-medium">Verified</span>
                  <span className="text-gray-500">{product.ref_year}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 shrink-0">ID</span>
                <p className="text-sm font-mono bg-[#E7F1F1] px-2 py-0.5 rounded shrink-0">
                  {product.uuid ? product.uuid.slice(0, 8) : product.node_id?.slice(0, 8) || '-'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 shrink-0">Classification</span>
                <p className="text-sm text-gray-700 text-right line-clamp-1" title={product.classific}>
                  {product.classific}
                </p>
              </div>

              {product.pdf_url && (
                <div className="pt-2">
                  <a 
                    href={product.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm text-teal-600 hover:text-teal-700 border border-teal-600 hover:border-teal-700 rounded-md py-1.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Update buttons layout for mobile */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
        <Button 
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6"
          onClick={onAddProduct}
        >
          Add more products
        </Button>
        <Button 
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6"
          onClick={() => onRemoveProduct(selectedProducts[0].uuid)}
        >
          Remove product
        </Button>
      </div>
    </div>
  );
}
