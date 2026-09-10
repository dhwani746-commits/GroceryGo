'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { getProductDiscount } from '@/lib/utils/discounts';
import { ShoppingCart, CheckCircle2, CircleSlash, Plus, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  original_price?: number | null;
  discount_percentage?: number | null;
  description?: string | null;
  image_urls?: string[] | null;
  stock_quantity: number;
  category?: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [addedTemp, setAddedTemp] = useState(false);
  const inStock = product.stock_quantity > 0;
  const cartItem = items.find((i) => i.id === product.id);
  const inCartCount = cartItem?.quantity || 0;
  const isInCart = inCartCount > 0;

  const numPrice = Number(product.price);
  const priceInCents = Math.round(numPrice * 100);
  const discount = getProductDiscount({
    price: numPrice,
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
  });
  const originalPriceInCents = discount?.originalPrice;
  const discountPercent = discount?.discountPercent;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: numPrice,
        quantity: 1,
        slug: product.slug,
        image: product.image_urls?.[0],
      });

      setAddedTemp(true);
      setTimeout(() => setAddedTemp(false), 1500);
    }
  };

  const imgUrl = product.image_urls?.[0];

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group overflow-hidden hover:-translate-y-1 relative">
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
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

          {/* Out of Stock Badge */}
          {!inStock && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 ? (
            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow">
              {discountPercent}% OFF
            </span>
          ) : null}

          {/* Quick Floating Add-to-Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`absolute bottom-3 right-3 p-2.5 sm:p-3 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer ${
              !inStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : addedTemp || isInCart
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white hover:scale-110'
            }`}
            aria-label="Add to Cart"
          >
            {!inStock ? (
              <CircleSlash size={16} strokeWidth={2} />
            ) : addedTemp || isInCart ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <Plus size={16} strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Details Content */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            {product.category && (
              <div className="text-[11px] font-semibold text-brand-primary-600 uppercase tracking-wide mb-1">
                {product.category}
              </div>
            )}
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-primary-600 transition line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="hidden sm:block text-xs text-neutral-500 line-clamp-2 mt-0.5">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing & Cart Counter */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-neutral-900">
                  {formatCurrency(numPrice)}
                </span>
                {originalPriceInCents && originalPriceInCents > priceInCents && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatCurrency(originalPriceInCents / 100)}
                  </span>
                )}
              </div>

              {inCartCount > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {inCartCount} in cart
                </span>
              )}
            </div>

            {/* Bottom Button */}
            <div onClick={(e) => e.preventDefault()}>
              {!inStock ? (
                <button
                  disabled
                  className="w-full rounded-xl font-semibold h-9 flex items-center justify-center gap-1 text-xs bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                >
                  <CircleSlash size={14} strokeWidth={1.5} />
                  Out of Stock
                </button>
              ) : isInCart ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-xl font-bold h-9 flex items-center justify-center gap-1.5 text-xs border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 size={14} strokeWidth={2} />
                  Add More ({inCartCount})
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-xl font-bold h-9 flex items-center justify-center gap-1.5 text-xs border border-brand-primary-700 bg-brand-primary-700 text-white hover:bg-brand-primary-600 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <ShoppingCart size={14} strokeWidth={2} />
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
