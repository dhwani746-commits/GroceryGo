'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Check, Flame, CircleSlash } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { Link001 } from '@/components/ui/skiper-ui/skiper40';
import { createClient } from '@/lib/supabase/client';

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  original_price?: number | null;
  discount_percentage?: number | null;
  category: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export function GroceryCardScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem, items } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, original_price, discount_percentage, category, image_urls, stock_quantity')
          .eq('is_visible', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching dynamic products for GroceryCardScroll:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Compute dynamic category list from database products
  const categories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category?.trim()).filter(Boolean) as string[])),
  ];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category?.trim() === selectedCategory);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: DbProduct) => {
    if (product.stock_quantity <= 0) return;
    const imgUrl = product.image_urls?.[0];
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      quantity: 1,
      image: imgUrl,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section className="my-10 bg-gradient-to-b from-brand-primary-50/40 via-white to-white p-6 rounded-3xl border border-brand-primary-100 shadow-sm relative">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary-100 text-brand-primary-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Flame size={14} className="text-amber-500 fill-amber-500" />
            Today's Fresh Grocery Deals
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Interactive Daily Essentials
          </h2>
        </div>

        {/* Skiper UI Animated View All Link & Scroll Controls */}
        <div className="flex items-center gap-4">
          <Link001
            href="/search"
            className="text-sm font-bold text-brand-primary-700 hover:text-brand-primary-900 transition"
          >
            Explore All Essentials
          </Link001>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-brand-primary-600 hover:text-white hover:border-brand-primary-600 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-brand-primary-600 hover:text-white hover:border-brand-primary-600 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Badges */}
      {!loading && categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-sm cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-primary-600 text-white shadow-brand-primary-200'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="flex gap-5 overflow-hidden py-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 animate-pulse"
            >
              <div className="w-full aspect-square bg-neutral-200 rounded-xl" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 bg-white rounded-2xl border border-dashed border-neutral-200">
          No products found in the database for this category.
        </div>
      ) : (
        /* Carousel Track Wrapper with Floating Scroll Arrows */
        <div className="relative group/track">
          {/* Left Floating Scroll Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 text-neutral-800 shadow-xl flex items-center justify-center hover:bg-brand-primary-600 hover:text-white hover:border-brand-primary-600 transition-all duration-300 cursor-pointer active:scale-90 opacity-90 group-hover/track:opacity-100"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* Right Floating Scroll Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 text-neutral-800 shadow-xl flex items-center justify-center hover:bg-brand-primary-600 hover:text-white hover:border-brand-primary-600 transition-all duration-300 cursor-pointer active:scale-90 opacity-90 group-hover/track:opacity-100"
            aria-label="Scroll Right"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>

          {/* Horizontal Scroll Cards Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 pt-2 px-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {filteredProducts.map((product) => {
              const isAdded = addedIds[product.id];
              const inCartCount = items.find((item) => item.id === product.id)?.quantity || 0;
              const price = Number(product.price);
              const originalPrice = product.original_price ? Number(product.original_price) : null;
              const discountPercent =
                product.discount_percentage ||
                (originalPrice && originalPrice > price
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : null);
              const inStock = product.stock_quantity > 0;
              const imgUrl = product.image_urls?.[0];

              return (
                <div
                  key={product.id}
                  className="snap-start flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden hover:-translate-y-1 relative"
                >
                  {/* Image & Badges Container */}
                  <Link href={`/products/${product.slug}`} className="block relative aspect-square w-full bg-neutral-50 overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🥦
                      </div>
                    )}

                    {/* Discount Tag */}
                    {discountPercent && discountPercent > 0 ? (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow">
                        {discountPercent}% OFF
                      </span>
                    ) : null}

                    {/* Out of stock badge */}
                    {!inStock ? (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                        Out of Stock
                      </span>
                    ) : product.stock_quantity <= 3 ? (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                        Only {product.stock_quantity} left
                      </span>
                    ) : null}
                  </Link>

                  {/* Quick Add Overlay Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!inStock}
                    className={`absolute bottom-28 right-3 p-3 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer ${
                      !inStock
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : isAdded
                        ? 'bg-emerald-600 text-white scale-110'
                        : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white hover:scale-110'
                    }`}
                    aria-label="Add to Cart"
                  >
                    {!inStock ? (
                      <CircleSlash size={18} strokeWidth={2} />
                    ) : isAdded ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      <Plus size={18} strokeWidth={3} />
                    )}
                  </button>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      {product.category && (
                        <div className="text-[11px] font-semibold text-brand-primary-600 uppercase tracking-wide mb-1">
                          {product.category}
                        </div>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-primary-600 transition line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Pricing & Cart Counter */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-neutral-900">
                          {formatCurrency(price)}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        )}
                      </div>

                      {inCartCount > 0 && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {inCartCount} in cart
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
