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

export function RelatedProducts({ 
  productId, 
  category,
  excludeIds = []
}: { 
  productId?: string | null; 
  category?: string | null;
  excludeIds?: string[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRelatedProducts() {
      const idsToExclude = [...excludeIds];
      if (productId && productId !== 'undefined') idsToExclude.push(productId);

      if (idsToExclude.length === 0 && !category) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .eq('is_visible', true)
          .is('deleted_at', null);

        if (idsToExclude.length > 0) {
          query = query.not('id', 'in', `(${idsToExclude.join(',')})`);
        }

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
        let differentCategoryQuery = supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .eq('is_visible', true)
          .is('deleted_at', null);

        if (idsToExclude.length > 0) {
          differentCategoryQuery = differentCategoryQuery.not('id', 'in', `(${idsToExclude.join(',')})`);
        }

        const { data: differentCategoryData, error: differentCategoryError } = await differentCategoryQuery.limit(8);

        if (differentCategoryError) throw differentCategoryError;
        setProducts(differentCategoryData || []);
      } catch (err) {
        console.error('Error loading related products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [productId, category, excludeIds.join(','), supabase]);

  if (loading) return <div className="text-center py-8 text-neutral-600">Loading suggestions...</div>;
  if (!products.length) return null;

  return (
    <section className="m-6 lg:m-24 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {category ? 'More from this Category' : 'You might also like'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
