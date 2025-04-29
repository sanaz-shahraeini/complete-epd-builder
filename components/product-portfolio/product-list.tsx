"use client";
import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
  memo,
  useReducer,
} from "react";
import { useTranslations } from "next-intl";
import { Table, Select, Button, IconButton, Box } from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  DotsVerticalIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { API_ROUTES, buildApiUrl } from "@/lib/api/config";
import ProductForm from "@/components/product-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "../language-switcher";
import { ModeToggle } from "../mode-toggle";
import "@radix-ui/themes/styles.css";
import ProductPortfolio from "@/components/product-portfolio/product-grid";
import Loading from "@/app/epd/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserStore } from "@/lib/store/user";

interface GeoData {
  geo: string;
  name: string;
}

interface Product {
  id: number;
  product_name: string;
  description: string;
  industry_solution: string;
  epd_verification_year: number;
  geo: string;
  category_name: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

const TruncatedText = React.memo(
  ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text.length > maxLength;

    const toggleExpand = useCallback(
      () => setIsExpanded(!isExpanded),
      [isExpanded]
    );

    if (!shouldTruncate) return <span>{text}</span>;

    return (
      <div className="relative">
        <span>{isExpanded ? text : `${text.slice(0, maxLength)}...`}</span>
        <button
          onClick={toggleExpand}
          className="ml-2 text-sm text-[#42B7B0] hover:text-[#3AA19B] dark:text-[#3AA19B] dark:hover:text-[#42B7B0] focus:outline-none"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      </div>
    );
  }
);

const safeParseResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error("Invalid JSON response from server");
    }
  } else {
    const text = await response.text();
    console.error("Received non-JSON response:", text);
    throw new Error("Server returned non-JSON response");
  }
};

const TableHeader = memo(({ t }: { t: any }) => (
  <Table.Header>
    <Table.Row className="bg-[#A5D3D1]/20 dark:bg-[#1B4242]/20">
      <Table.ColumnHeaderCell className="px-4 py-3 min-w-[120px]">
        {t("columns.name")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="hidden md:table-cell px-4 py-3 min-w-[200px]">
        {t("columns.description")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="px-4 py-3">
        {t("columns.industrySolution")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="hidden lg:table-cell px-4 py-3">
        {t("columns.category")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="px-4 py-3">
        {t("columns.verificationYear")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="px-4 py-3">
        {t("columns.country")}
      </Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell className="px-4 py-3" />
    </Table.Row>
  </Table.Header>
));

const ProductRow = memo(
  ({ product, index, t }: { product: Product; index: number; t: any }) => (
    <Table.Row className="hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20">
      <Table.Cell className="px-4 py-3">
        <TruncatedText text={product.product_name} maxLength={15} />
      </Table.Cell>
      <Table.Cell className="hidden md:table-cell px-4 py-3">
        <TruncatedText text={product.description} maxLength={120} />
      </Table.Cell>
      <Table.Cell className="px-4 py-3">{product.industry_solution}</Table.Cell>
      <Table.Cell className="hidden lg:table-cell px-4 py-3">
        <TruncatedText text={product.category_name} maxLength={15} />
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        {product.epd_verification_year || "N/A"}
      </Table.Cell>
      <Table.Cell className="px-4 py-3">{product.geo || "-"}</Table.Cell>
      <Table.Cell className="px-4 py-3">
        <IconButton
          variant="ghost"
          className="text-[#42B7B0] dark:text-[#3AA19B] hover:text-[#1B4242] dark:hover:text-[#A5D3D1] focus:outline-none"
        >
          <DotsVerticalIcon />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
);

export default function ProductListComponent() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("productList");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts] = useState("All products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Move searchParams state to use reducer for better state management
  const [searchParams, setSearchParams] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      page: 1,
      pageSize: itemsPerPage,
      search: "",
    }
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleViewChange = useCallback((view: string) => {
    setView(view === "grid" ? "grid" : "list");
  }, []);

  // Optimize fetch products to not recreate on every searchParams change
  const fetchProducts = useCallback(async () => {
    if (!session?.accessToken) return;

    const { setShowSignInModal } = useUserStore.getState();

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page_size: String(searchParams.pageSize),
        page: String(searchParams.page),
        ...(searchParams.search && { search: searchParams.search }),
      });

      const url = `${buildApiUrl(API_ROUTES.PRODUCTS.LIST)}?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Show sign-in modal instead of redirecting
          setShowSignInModal(true);
          return;
        }
        throw new Error(`API Error (${response.status})`);
      }

      const data = await safeParseResponse(response);
      setProducts(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, router, searchParams]);

  // Update search params when search term changes
  useEffect(() => {
    setSearchParams({ search: debouncedSearchTerm, page: 1 });
  }, [debouncedSearchTerm]);

  // Update searchParams when currentPage changes
  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage]);

  // Fetch products when searchParams change
  useEffect(() => {
    if (session?.accessToken) {
      fetchProducts();
    }
  }, [fetchProducts, session?.accessToken]);

  // Optimize filtered products
  const filteredProducts = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (!trimmedSearch) return products;
    
    const searchWords = trimmedSearch.split(/\s+/).filter(word => word.length > 0);
    
    return products.filter((product) => {
      const productName = product.product_name.toLowerCase();
      return searchWords.every(word => productName.includes(word));
    });
  }, [products, searchTerm]);

  const getVisiblePages = useCallback(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift(1);
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(totalPages);
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return [1, ...rangeWithDots, totalPages].filter(
      (x, i, a) => a.indexOf(x) === i
    );
  }, [currentPage, totalPages]);

  const headerStyles = "grid grid-cols-1 md:grid-cols-3 items-center gap-4";
  const searchContainerStyles = "relative w-full max-w-[600px]";

  return (
    <>
      {!showForm && (
        <div className=" absolute top-4 right-4 flex items-center gap-2 z-50 bg-white dark:bg-black backdrop-blur-sm p-2 rounded-lg">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      )}

      {showForm ? (
        <ProductForm onClose={() => setShowForm(false)} />
      ) : (
        <div className="p-4 md:p-8 m-4 md:m-8 bg-white dark:bg-black min-h-screen">
          <div className="space-y-6">
            <div className={headerStyles}>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                {t("productPortfolio")}
              </h1>
              <Box className={searchContainerStyles}>
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A5D3D1]/50 focus:border-[#A5D3D1]/50 dark:focus:ring-[#A5D3D1]/30 dark:focus:border-[#A5D3D1]/30 dark:text-white"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#42B7B0]" />
              </Box>
              <div className="flex justify-end">
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleViewChange("list")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      view === "list"
                        ? "bg-[#A5D3D1]/20 text-[#42B7B0] dark:bg-[#1B4242]/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange("grid")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      view === "grid"
                        ? "bg-[#A5D3D1]/20 text-[#42B7B0] dark:bg-[#1B4242]/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
              <Select.Root>
                <Select.Content>
                  <Select.Item value="All products">
                    {t("filter.allProducts")}
                  </Select.Item>
                  <Select.Item value="My products">
                    {t("filter.myProducts")}
                  </Select.Item>
                </Select.Content>
              </Select.Root>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm lg:text-base dark:bg-[#3AA19B] dark:hover:bg-[#42B7B0] px-3 py-2 md:px-4 md:py-2 rounded-md transition-colors duration-200 ease-in-out"
              >
                {t("newProduct")}
              </button>
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            {view === "grid" ? (
              <ProductPortfolio searchTerm={searchTerm} />
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-black rounded-lg shadow-sm mt-6 overflow-x-auto">
                  <Table.Root>
                    <TableHeader t={t} />
                    <Table.Body>
                      {isLoading ? (
                        <SkeletonRows />
                      ) : error ? (
                        <ErrorRow
                          key="error"
                          error={error}
                          onRetry={fetchProducts}
                          t={t}
                        />
                      ) : filteredProducts.length === 0 ? (
                        <EmptyRow key="empty" searchTerm={searchTerm} t={t} />
                      ) : (
                        filteredProducts.map((product, index) => (
                          <ProductRow
                            key={`product-${product.id || index}`}
                            product={product}
                            index={index}
                            t={t}
                          />
                        ))
                      )}
                    </Table.Body>
                  </Table.Root>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 md:w-10 md:h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={t("actions.previousPage")}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {getVisiblePages().map((page, index) =>
                      typeof page === "number" ? (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setCurrentPage(page)}
                          className={`p-2 md:w-10 md:h-10 rounded-lg border ${
                            currentPage === page
                              ? "bg-[#3AA19B] text-white border-[#3AA19B]"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span
                          key={index}
                          className="p-2 md:w-10 md:h-10 flex items-center justify-center text-gray-500"
                        >
                          {page}
                        </span>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 md:w-10 md:h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={t("actions.nextPage")}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </div>
      )}
    </>
  );
}

const SkeletonRows = memo(() => (
  <>
    {[...Array(10)].map((_, index) => (
      <Table.Row key={index}>
        <Table.Cell className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </Table.Cell>
        <Table.Cell className="hidden md:table-cell px-4 py-3">
          <Skeleton className="h-4 w-48" />
        </Table.Cell>
        <Table.Cell className="px-4 py-3">
          <Skeleton className="h-4 w-32" />
        </Table.Cell>
        <Table.Cell className="hidden lg:table-cell px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </Table.Cell>
        <Table.Cell className="px-4 py-3">
          <Skeleton className="h-4 w-16" />
        </Table.Cell>
        <Table.Cell className="px-4 py-3">
          <Skeleton className="h-4 w-16" />
        </Table.Cell>
        <Table.Cell className="px-4 py-3">
          <Skeleton className="h-6 w-6 rounded-full" />
        </Table.Cell>
      </Table.Row>
    ))}
  </>
));

const ErrorRow = memo(
  ({ error, onRetry, t }: { error: string; onRetry: () => void; t: any }) => (
    <Table.Row>
      <Table.Cell
        colSpan={7}
        className="text-center py-8 text-red-500 dark:text-red-400"
      >
        {error}
        <Button
          variant="soft"
          className="ml-4 text-[#42B7B0] dark:text-[#3AA19B] hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20"
          onClick={onRetry}
        >
          {t("actions.retry")}
        </Button>
      </Table.Cell>
    </Table.Row>
  )
);

const EmptyRow = memo(({ searchTerm, t }: { searchTerm: string; t: any }) => (
  <Table.Row>
    <Table.Cell
      colSpan={7}
      className="text-center py-8 text-[#5C8374] dark:text-[#A5D3D1]"
    >
      {searchTerm ? t("status.noSearchResults") : t("status.noProducts")}
    </Table.Cell>
  </Table.Row>
));
