'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProducts } from '@/lib/store/products';
import { ProductCard } from './ProductCard';

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

interface ProductSegment {
  category: string;
  products: Product[];
}

export function ProductSegments() {
  const [segments, setSegments] = useState<ProductSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();
  const setStoreProducts = useProducts((state) => state.setProducts);

  useEffect(() => {
    setLoading(true);

    async function fetchProducts() {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity, category')
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(30);

        if (fetchError) throw fetchError;

        // Store all products in Zustand
        setStoreProducts(data || []);

        // Group products by category
        const groupedByCategory: { [key: string]: Product[] } = {};
        (data || []).forEach((product) => {
          const cat = product.category || 'Other';
          if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = [];
          }
          groupedByCategory[cat].push(product);
        });

        // Convert to segments array (limit to 8 per segment)
        // Only show categories with 5+ products
        const productSegments: ProductSegment[] = Object.entries(groupedByCategory)
          .map(([category, products]) => ({
            category,
            products: products.slice(0, 8),
          }))
          .filter((seg) => seg.products.length >= 5);

        setSegments(productSegments);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [setStoreProducts]);

  if (loading) {
    return (
      <div className="space-y-12">
        {Array.from({ length: 2 }).map((_, segIdx) => (
          <div key={segIdx}>
            {/* Skeleton segment header */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-5 w-16 bg-neutral-200 rounded animate-pulse" />
            </div>
            {/* Skeleton product cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
              {Array.from({ length: 4 }).map((_, cardIdx) => (
                <div key={cardIdx} className="rounded-lg border border-neutral-200 overflow-hidden">
                  <div className="w-full aspect-square bg-neutral-200 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 bg-neutral-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2" />
                    <div className="h-9 bg-neutral-200 rounded-md animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return <div className="text-center py-8 text-status-danger-600">{error}</div>;
  if (!segments.length)
    return <div className="text-center py-8 text-neutral-600">No products available</div>;

  return (
    <div className="space-y-12">
      {segments.map((segment) => (
        <div key={segment.category}>
          {/* Segment header with View All link */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 capitalize">
              Explore {segment.category}
            </h3>
            <a
              href={`/search?q=${encodeURIComponent(segment.category)}`}
              className="text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-700 hover:underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              View all →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {segment.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
