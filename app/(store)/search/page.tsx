'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProducts } from '@/lib/store/products';
import { ProductCard } from '@/components/store/ProductCard';
import { Search as SearchIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const cachedProducts = useProducts((state) => state.products);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const searchProducts = async () => {
      try {
        // Search in cached products first
        const searchLower = query.toLowerCase();
        const localResults = cachedProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        );

        // If results found locally, use them
        if (localResults.length > 0) {
          setProducts(localResults);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from database
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .or(
            `name.ilike.%${query}%,description.ilike.%${query}%`
          )
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, cachedProducts]);

  return (
    <div className="min-h-screen bg-neutral-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
  );
}
