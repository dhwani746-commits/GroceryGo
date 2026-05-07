'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Home, 
  Utensils, 
  Bath, 
  Sofa, 
  Lamp, 
  Package, 
  Shirt, 
  Book, 
  Gamepad2, 
  Baby, 
  Heart, 
  ShoppingBag,
  Star,
  Zap,
  Coffee,
  Car,
  Music,
  Camera,
  Dumbbell,
  Palette
} from 'lucide-react';

interface Category {
  name: string;
  image_url: string;
}

// Icon mapping for different categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  // Map category names to appropriate icons
  const iconMap: Record<string, any> = {
    'home': Home,
    'kitchen': Utensils,
    'kitchenware': Utensils,
    'bath': Bath,
    'bathroom': Bath,
    'furniture': Sofa,
    'sofa': Sofa,
    'living': Sofa,
    'lighting': Lamp,
    'lamps': Lamp,
    'storage': Package,
    'organization': Package,
    'clothing': Shirt,
    'fashion': Shirt,
    'apparel': Shirt,
    'books': Book,
    'education': Book,
    'toys': Gamepad2,
    'games': Gamepad2,
    'baby': Baby,
    'kids': Baby,
    'health': Heart,
    'beauty': Heart,
    'personal': Heart,
    'bags': ShoppingBag,
    'accessories': ShoppingBag,
    'decor': Star,
    'decoration': Star,
    'electronics': Zap,
    'gadgets': Zap,
    'coffee': Coffee,
    'drinkware': Coffee,
    'car': Car,
    'auto': Car,
    'music': Music,
    'audio': Music,
    'camera': Camera,
    'photography': Camera,
    'sports': Dumbbell,
    'fitness': Dumbbell,
    'art': Palette,
    'craft': Palette,
    'hobby': Palette,
  };
  
  return iconMap[name] || ShoppingBag; // Default icon
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
        <div className="absolute left-0 top-0 bottom-0 w-8 from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 from-white to-transparent z-10 pointer-events-none" />
        
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
                <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center group-hover:bg-brand-primary-100 transition-colors duration-200 border-2 border-transparent group-hover:border-brand-primary-200">
                  <Icon 
                    size={24} 
                    className="text-neutral-600 group-hover:text-brand-primary-600 transition-colors duration-200" 
                  />
                </div>
                
                {/* Category name */}
                <h4 className="text-xs font-medium text-center text-gray-700 group-hover:text-brand-primary-700 transition-colors duration-200 capitalize whitespace-nowrap max-w-[60px] truncate">
                  {category.name}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
