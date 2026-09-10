'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Carrot,
  Milk,
  Wheat,
  Coffee,
  Cookie,
  Sparkles,
  ShoppingBag,
  Utensils,
  Package,
  Heart,
  Baby,
  Dog,
  Fish,
  Store,
  Flame
} from 'lucide-react';

interface Category {
  name: string;
  image_url: string;
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('fruit') || name.includes('veggie') || name.includes('vegetable') || name.includes('produce')) return Carrot;
  if (name.includes('dairy') || name.includes('milk') || name.includes('bakery') || name.includes('bread') || name.includes('cheese') || name.includes('egg')) return Milk;
  if (name.includes('staple') || name.includes('rice') || name.includes('atta') || name.includes('grain') || name.includes('dal') || name.includes('flour') || name.includes('wheat')) return Wheat;
  if (name.includes('snack') || name.includes('biscuit') || name.includes('chip') || name.includes('cookie') || name.includes('munchie')) return Cookie;
  if (name.includes('beverage') || name.includes('drink') || name.includes('tea') || name.includes('coffee') || name.includes('juice')) return Coffee;
  if (name.includes('personal') || name.includes('beauty') || name.includes('hygiene') || name.includes('soap')) return Heart;
  if (name.includes('clean') || name.includes('household') || name.includes('detergent') || name.includes('home')) return Sparkles;
  if (name.includes('baby') || name.includes('kid')) return Baby;
  if (name.includes('pet')) return Dog;
  if (name.includes('instant') || name.includes('noodle') || name.includes('ready') || name.includes('frozen') || name.includes('meal')) return Utensils;
  if (name.includes('meat') || name.includes('fish') || name.includes('chicken') || name.includes('sea')) return Fish;
  
  return ShoppingBag;
};

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
            image_url: cat.image_url || '/no-image.svg'
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
              <div className="w-full aspect-square rounded-2xl bg-neutral-200 animate-pulse" />
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
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Store className="text-brand-primary-600" size={24} /> Shop by Category
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const hasCustomImage = category.image_url && !category.image_url.includes('no-image.svg') && !category.image_url.includes('placeholder');

          return (
            <Link
              key={category.name}
              href={`/search?q=${encodeURIComponent(category.name)}`}
              className="flex flex-col items-center gap-2 group p-3 bg-white rounded-2xl border border-neutral-200 hover:border-brand-primary-500 hover:shadow-md transition-all duration-200"
            >
              {/* Icon / Image Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-brand-primary-50 border border-brand-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {hasCustomImage ? (
                  <div
                    className="absolute inset-0 rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url('${category.image_url}')` }}
                  />
                ) : (
                  <Icon size={30} className="text-brand-primary-600 group-hover:text-brand-primary-700 transition-colors" />
                )}
              </div>
              
              {/* Category Name Below */}
              <h4 className="text-xs md:text-sm font-semibold text-center text-neutral-900 capitalize line-clamp-2 w-full px-1">
                {category.name}
              </h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
