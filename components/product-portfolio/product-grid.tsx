"use client";
import React, { useState, useEffect, useCallback, useReducer, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import dynamic from "next/dynamic";

interface Product {
  id: number;
  product_name: string;
  description: string;
  industry_solution: string;
  epd_verification_year: number;
  geo: string;
  category_name: string;
  image_url: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const t = useTranslations("productList");
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="p-4 mt-4 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={!imageError ? (product.image_url || "/placeholder.jpg") : "/placeholder.jpg"}
            alt={product.product_name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {product.product_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.industrySolution")}:</span>
              <p className="text-gray-900 dark:text-white">{product.industry_solution}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.category")}:</span>
              <p className="text-gray-900 dark:text-white">{product.category_name}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.verificationYear")}:</span>
              <p className="text-gray-900 dark:text-white">{product.epd_verification_year || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.country")}:</span>
              <p className="text-gray-900 dark:text-white">{product.geo || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const SkeletonCard = () => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  </div>
);

const ProductPortfolio = dynamic(() => Promise.resolve(({ searchTerm = "" }: { searchTerm?: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession()?.data as { accessToken: string } | null;
  const router = useRouter();
  const t = useTranslations("productList");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9; // Show 9 items per page in grid view
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const [searchParams, setSearchParams] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      page: 1,
      pageSize: itemsPerPage,
      search: "",
    }
  );

  // Update search params when search term changes
  useEffect(() => {
    setSearchParams({ search: searchTerm, page: 1 });
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page_size: String(searchParams.pageSize),
        page: String(searchParams.page),
        ...(searchParams.search && { search: searchParams.search }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signin");
          return;
        }
        throw new Error(`API Error (${response.status})`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error("Invalid data format received from API");
      }

      setProducts(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Failed to fetch products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, router, searchParams]);

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

  // Filter products based on search term
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

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: itemsPerPage }, (_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          : filteredProducts.map((product) => (
              <ProductCard 
                key={`product-${product.id || product.product_name}`} 
                product={product} 
              />
            ))}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? "No products found matching your search" : "No products found"}
          </div>
        )}
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
  );
}), { ssr: false });

export default ProductPortfolio;
