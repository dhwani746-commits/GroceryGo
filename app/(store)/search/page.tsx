'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useProducts } from '@/lib/store/products';
import { ProductCard } from '@/components/store/ProductCard';
import { Search as SearchIcon } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { RelatedProducts } from '@/components/store/RelatedProducts';
import Link from 'next/link';

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

import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/lib/api/products';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const cachedProducts = useProducts((state) => state.products);

  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: !!query.trim(),
  });

  // Calculate final products (local cache search if possible, else fetched)
  const products = (() => {
    if (!query.trim()) return [];
    
    const searchLower = query.toLowerCase();
    const localResults = cachedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
    );

    if (localResults.length > 0) {
      return localResults;
    }
    return fetchedProducts || [];
  })();

  const loading = !!query.trim() && isLoading && products.length === 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6">
            ← Back to Products
          </Link>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Search Results
            </h1>
            <p className="text-neutral-600">
              {query ? `Results for "${query}"` : 'Enter a search term'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Searching...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg">
                {query ? 'No products found matching your search' : 'Start typing to search'}
              </p>
              {query && (
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 text-brand-primary-600 hover:text-brand-primary-500 font-medium"
                >
                  Browse all products
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-row overflow-x-auto gap-4 lg:grid lg:grid-cols-4 lg:gap-6 pb-2">
              {products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64 md:w-72 lg:w-auto">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <RelatedProducts productId={products[0]?.id} category={products[0]?.category || null} />
      </>
  );
}
