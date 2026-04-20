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

  if (loading)
    return <div className="text-center py-8 text-neutral-600">Loading products...</div>;
  if (error)
    return <div className="text-center py-8 text-status-danger-600">{error}</div>;
  if (!segments.length)
    return <div className="text-center py-8 text-neutral-600">No products available</div>;

  return (
    <div className="space-y-12">
      {segments.map((segment) => (
        <div key={segment.category}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
            In {segment.category}
          </h3>
          <div className="flex flex-row overflow-x-auto gap-4 lg:grid lg:grid-cols-4 lg:gap-6 pb-2">
            {segment.products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 md:w-72 lg:w-auto"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
