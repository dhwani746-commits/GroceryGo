'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export function RelatedProducts({ productId, category }: { productId: string; category: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        let query = supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .neq('id', productId);

        // Try to fetch from same category first
        if (category) {
          const { data: sameCategoryData, error: sameCategoryError } = await query
            .eq('category', category)
            .limit(8);

          if (!sameCategoryError && sameCategoryData && sameCategoryData.length > 0) {
            setProducts(sameCategoryData);
            setLoading(false);
            return;
          }
        }

        // If no same category products, fetch from different categories
        const { data: differentCategoryData, error: differentCategoryError } = await supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .neq('id', productId)
          .limit(8);

        if (differentCategoryError) throw differentCategoryError;
        setProducts(differentCategoryData || []);
      } catch (err) {
        console.error('Error loading related products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [productId, category, supabase]);

  if (loading) return <div className="text-center py-8 text-neutral-600">Loading suggestions...</div>;
  if (!products.length) return null;

  return (
    <section className="mt-16 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {category ? 'More from this Category' : 'You might also like'}
      </h3>
      <div className="flex flex-row overflow-x-auto gap-4 lg:grid lg:grid-cols-4 lg:gap-6 pb-2">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 md:w-72 lg:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
