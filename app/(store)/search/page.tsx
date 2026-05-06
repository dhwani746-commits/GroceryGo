'use client';
export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/store/ProductCard';
import { Header } from '@/components/shared/Header';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { PriceRangeFilter } from '@/components/store/PriceRangeFilter';
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  X,
  PackageX,
} from 'lucide-react';
import Link from 'next/link';
import { RelatedProducts } from '@/components/store/RelatedProducts';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
  category: string | null;
}

interface Meta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type SortOption = 'newest' | 'price_asc' | 'price_desc';

const PER_PAGE = 12;
const DEFAULT_MIN_PRICE = 100;
const DEFAULT_MAX_PRICE = 50000;

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest First',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

function getPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption;
  const inStock = searchParams.get('in_stock') === '1';
  const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: DEFAULT_MIN_PRICE, max: DEFAULT_MAX_PRICE });
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);


  const fetchPriceRange = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      const allProducts = json.data ?? [];
      
      if (allProducts.length > 0) {
        const prices = allProducts.map((p: Product) => parseFloat(p.price));
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
      }
    } catch (error) {
      console.error('Failed to fetch price range:', error);
      // Keep default values if fetch fails
    }
  }, []);

  const fetchPage = useCallback(async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setProducts(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch {
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceRange();
  }, [fetchPriceRange]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE), sort });
    if (query) params.set('q', query);
    if (inStock) params.set('in_stock', '1');
    if (minPrice !== undefined) params.set('min_price', String(minPrice));
    if (maxPrice !== undefined) params.set('max_price', String(maxPrice));
    fetchPage(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, page, sort, inStock, minPrice, maxPrice, fetchPage]);

  /** Push a new URL preserving all current params except overrides, resetting to page 1 */
  const pushFilter = (overrides: Record<string, string | null>) => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (sort) p.set('sort', sort);
    if (inStock) p.set('in_stock', '1');
    if (minPrice !== undefined) p.set('min_price', String(minPrice));
    if (maxPrice !== undefined) p.set('max_price', String(maxPrice));
    p.set('page', '1');

    for (const [key, val] of Object.entries(overrides)) {
      if (val === null || val === '') p.delete(key);
      else p.set(key, val);
    }
    router.push(`/search?${p.toString()}`);
    setFilterOpen(false);
  };

  const navigate = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort) params.set('sort', sort);
    if (inStock) params.set('in_stock', '1');
    if (minPrice !== undefined) params.set('min_price', String(minPrice));
    if (maxPrice !== undefined) params.set('max_price', String(maxPrice));
    params.set('page', String(p));
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    router.push(`/search?${p.toString()}`);
  };

  const hasActiveFilters = sort !== 'newest' || inStock || minPrice !== undefined || maxPrice !== undefined;
  const pageRange = meta ? getPageRange(page, meta.totalPages) : [];

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
          <div className="w-full aspect-square bg-neutral-200" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
            <div className="h-9 bg-neutral-200 rounded-lg mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: query ? `Search: "${query}"` : 'All Products' }]}
            className="mb-4"
          />

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {query ? `Results for "${query}"` : 'All Products'}
              </h1>
              {!loading && meta && (
                <p className="text-sm text-neutral-500 mt-1">
                  {meta.total === 0
                    ? 'No products found'
                    : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, meta.total)} of ${meta.total} product${meta.total === 1 ? '' : 's'}`}
                </p>
              )}
            </div>

            {/* Filter / Sort controls */}
            <div className="flex items-center gap-2 flex-shrink-0 justify-end" ref={filterRef}>
              {/* Active filter chips */}
              {inStock && (
                <button
                  onClick={() => pushFilter({ in_stock: null, page: '1' })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-status-success-700 bg-status-success-50 border border-status-success-200 px-2.5 py-1.5 rounded-full hover:bg-status-success-100 transition"
                >
                  In Stock <X size={11} />
                </button>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-2 transition"
                >
                  Clear all
                </button>
              )}

              {/* Filter dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl border shadow-sm transition ${hasActiveFilters
                      ? 'bg-brand-primary-600 text-white border-brand-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                >
                  <SlidersHorizontal size={14} />
                  {hasActiveFilters ? 'Filtered' : 'Sort & Filter'}
                  <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 p-4 space-y-5 sm:right-0 sm:w-72 lg:right-0">
                    <div className="max-h-[70vh] overflow-y-auto">

                    {/* Sort */}
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Sort by</p>
                      <div className="space-y-1">
                        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => pushFilter({ sort: val, page: '1' })}
                            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${sort === val
                                ? 'bg-brand-primary-50 text-brand-primary-700 font-medium'
                                : 'text-neutral-700 hover:bg-neutral-50'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Price Range</p>
                      <PriceRangeFilter
                        minPrice={priceRange.min}
                        maxPrice={priceRange.max}
                        currentMin={minPrice}
                        currentMax={maxPrice}
                        onApply={(min, max) => {
                          const params = new URLSearchParams();
                          if (query) params.set('q', query);
                          if (sort) params.set('sort', sort);
                          if (inStock) params.set('in_stock', '1');
                          params.set('min_price', String(min));
                          params.set('max_price', String(max));
                          params.set('page', '1');
                          router.push(`/search?${params.toString()}`);
                          setFilterOpen(false);
                        }}
                      />
                    </div>

                    {/* In stock toggle */}
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Availability</p>
                      <button
                        onClick={() => pushFilter({ in_stock: inStock ? null : '1', page: '1' })}
                        className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg border transition ${inStock
                            ? 'border-status-success-400 bg-status-success-50 text-status-success-700 font-medium'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                      >
                        <span>In Stock Only</span>
                        <span className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${inStock ? 'bg-status-success-500 justify-end' : 'bg-neutral-200 justify-start'}`}>
                          <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </span>
                      </button>
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={() => { clearFilters(); setFilterOpen(false); }}
                        className="w-full text-center text-xs text-status-danger-600 hover:text-status-danger-800 transition py-1"
                      >
                        Clear all filters
                      </button>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <SkeletonGrid />
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <PackageX size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-lg font-semibold text-neutral-800 mb-1">
                {query ? `No results for "${query}"` : 'No products match your filters'}
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                {hasActiveFilters ? 'Try changing or removing filters.' : query ? 'Try a different search term.' : 'Check back soon.'}
              </p>
              {(query || hasActiveFilters) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-xl text-sm font-medium hover:bg-brand-primary-700 transition"
                >
                  {hasActiveFilters ? 'Clear Filters' : 'Browse all products'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && meta && meta.totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate(page - 1)}
                  disabled={!meta.hasPrevPage}
                  aria-label="Previous page"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageRange.map((p, i) =>
                  p === '…' ? (
                    <span key={`e-${i}`} className="flex items-center justify-center w-9 h-9 text-sm text-neutral-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => navigate(p as number)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition shadow-sm border ${p === page
                          ? 'bg-brand-primary-600 text-white border-brand-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => navigate(page + 1)}
                  disabled={!meta.hasNextPage}
                  aria-label="Next page"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-xs text-neutral-400">Page {page} of {meta.totalPages}</p>
            </div>
          )}

          {/* Related Products — anchored to the most common category on this page.
               Only shown when the grid has results; excludes all visible IDs. */}
          {!loading && products.length > 0 && (() => {
            // Find the modal (most frequent) category among current results
            const freq: Record<string, number> = {};
            for (const p of products) {
              if (p.category) freq[p.category] = (freq[p.category] ?? 0) + 1;
            }
            const topCategory = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
            const excludeIds  = products.map((p) => p.id);

            return (
              <div className="mt-4">
                <RelatedProducts
                  productId={null}
                  category={topCategory}
                  excludeIds={excludeIds}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}
