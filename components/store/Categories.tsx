'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Category {
  name: string;
  image_url: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Get distinct categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('products')
          .select('category')
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .neq('category', null);

        if (categoryError) throw categoryError;

        // Get unique categories
        const uniqueCategories = Array.from(
          new Set((categoryData || []).map((p) => p.category).filter(Boolean))
        ) as string[];

        // For each category, fetch a random product image
        const categoriesWithImages: Category[] = [];

        for (const category of uniqueCategories) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('image_urls')
            .eq('category', category)
            .eq('is_visible', true)
            .eq('is_deleted', false)
            .limit(1);

          if (!productError && productData && productData.length > 0) {
            const images = productData[0].image_urls as string[] | null;
            const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.png';
            categoriesWithImages.push({
              name: category,
              image_url: imageUrl,
            });
          }
        }

        setCategories(categoriesWithImages);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  if (loading) return <div className="text-center py-8 text-neutral-600">Loading categories...</div>;
  if (!categories.length) return null;

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h3>
      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/search?q=${encodeURIComponent(category.name)}`}
            className="flex flex-col items-center gap-2 group"
          >
            {/* Image Square */}
            <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: `url('${category.image_url}')`,
                }}
              />
            </div>
            
            {/* Category Name Below */}
            <h4 className="text-xs md:text-sm font-semibold text-center text-gray-900 capitalize line-clamp-2 w-full px-1">
              {category.name}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
