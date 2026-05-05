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
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('name, image_url')
          .gt('product_count', 0)
          .order('name');

        if (categoryError) throw categoryError;

        setCategories(
          (categoryData || []).map(cat => ({
            name: cat.name,
            image_url: cat.image_url || '/placeholder.png'
          }))
        );
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mb-16">
        <div className="h-8 w-44 bg-neutral-200 rounded-md animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-lg bg-neutral-200 animate-pulse" />
              <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!categories.length) return null;

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
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
