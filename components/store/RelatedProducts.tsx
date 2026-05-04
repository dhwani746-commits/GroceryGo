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
  excludeIds = [],
  price
}: { 
  productId?: string | null; 
  category?: string | null;
  excludeIds?: string[];
  price?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('Related Products');
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
        // Strategy: same category products in similar price range
        if (category && price) {
          const priceMin = price * 0.6; // 40% lower
          const priceMax = price * 1.6; // 60% higher
          
          const { data: sameCategoryData, error: sameCategoryError } = await supabase
            .from('products')
            .select('id, name, slug, price, description, image_urls, stock_quantity')
            .eq('is_visible', true)
            .is('deleted_at', null)
            .eq('category', category)
            .gte('price', priceMin)
            .lte('price', priceMax)
            .not('id', 'in', `(${idsToExclude.join(',')})`)
            .limit(8);

          if (!sameCategoryError && sameCategoryData && sameCategoryData.length > 0) {
            setProducts(sameCategoryData);
            setSectionTitle(`More ${category} in This Price Range`);
            setLoading(false);
            return;
          }
        }

        // Fallback: same category only
        if (category) {
          let query = supabase
            .from('products')
            .select('id, name, slug, price, description, image_urls, stock_quantity')
            .eq('is_visible', true)
            .is('deleted_at', null)
            .eq('category', category);

          if (idsToExclude.length > 0) {
            query = query.not('id', 'in', `(${idsToExclude.join(',')})`);
          }

          const { data: sameCategoryData, error: sameCategoryError } = await query.limit(8);

          if (!sameCategoryError && sameCategoryData && sameCategoryData.length > 0) {
            setProducts(sameCategoryData);
            setSectionTitle(`More from ${category}`);
            setLoading(false);
            return;
          }
        }

        // Final fallback: any similar-priced products
        if (price) {
          const priceMin = price * 0.5;
          const priceMax = price * 1.5;

          let query = supabase
            .from('products')
            .select('id, name, slug, price, description, image_urls, stock_quantity')
            .eq('is_visible', true)
            .is('deleted_at', null)
            .gte('price', priceMin)
            .lte('price', priceMax);

          if (idsToExclude.length > 0) {
            query = query.not('id', 'in', `(${idsToExclude.join(',')})`);
          }

          const { data: similarPriceData, error: similarPriceError } = await query.limit(8);

          if (!similarPriceError && similarPriceData && similarPriceData.length > 0) {
            setProducts(similarPriceData);
            setSectionTitle('Frequently Bought Together');
            setLoading(false);
            return;
          }
        }

        // Ultimate fallback: any products
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
        if (differentCategoryData && differentCategoryData.length > 0) {
          setProducts(differentCategoryData);
          setSectionTitle('You Might Also Like');
        }
      } catch (err) {
        console.error('Error loading related products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [productId, category, price, excludeIds.join(','), supabase]);

  if (loading) return <div className="text-center py-8 text-neutral-600">Loading suggestions...</div>;
  if (!products.length) return null;

  return (
    <section className="m-6 lg:m-24 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {sectionTitle}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
