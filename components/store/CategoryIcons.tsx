'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Apple,
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
  Flame,
  Wine,
  Egg,
  Fish,
  Soup,
  Zap,
  Home,
  Shirt,
  Bath,
  Smile,
  ShieldCheck,
  Store,
  Layers
} from 'lucide-react';

interface Category {
  name: string;
  image_url: string;
}

// Icon mapping for all grocery, food & household categories
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
  
  // General fallbacks
  const iconMap: Record<string, any> = {
    'home': Home,
    'kitchen': Utensils,
    'bath': Bath,
    'storage': Package,
    'clothing': Shirt,
    'electronics': Zap,
    'deals': Flame,
    'essential': Store,
  };
  
  return iconMap[name] || ShoppingBag;
};

export function CategoryIcons() {
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
      <div className="">
        <div className="h-6 w-32 bg-neutral-200 rounded-md animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="">      
      {/* Horizontal scroll container */}
      <div className="relative">
        {/* Scroll indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* Scrollable content */}
        <div className="flex justify-between gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth lg:justify-center lg:gap-8">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            
            return (
              <Link
                key={category.name}
                href={`/search?q=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 group flex-shrink-0 min-w-0"
              >
                {/* Icon container */}
                <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center group-hover:bg-brand-primary-100 group-hover:scale-105 transition-all duration-200 border-2 border-transparent group-hover:border-brand-primary-200">
                  <Icon 
                    size={24} 
                    className="text-neutral-600 group-hover:text-brand-primary-600 transition-colors duration-200" 
                  />
                </div>
                
                {/* Category name */}
                <h4 className="text-xs font-medium text-center text-gray-700 group-hover:text-brand-primary-700 transition-colors duration-200 capitalize max-w-[72px] leading-tight line-clamp-2">
                  {category.name}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
      

    </div>
  );
}
