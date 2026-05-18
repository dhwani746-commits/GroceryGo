'use client';

import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { getProductDiscount } from '@/lib/utils/discounts';
import { ShoppingCart, CheckCircle2, CircleSlash } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  original_price?: number | null;
  discount_percentage?: number | null;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inStock = product.stock_quantity > 0;
  const cartItem = items.find((i) => i.id === product.id);
  const isInCart = !!cartItem;

  const priceInCents = Math.round(Number(product.price) * 100);
  const discount = getProductDiscount({
    price: Number(product.price),
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
  });
  const originalPrice = discount?.originalPrice ?? priceInCents;
  const savingsInCents = discount?.savingsInCents ?? 0;
  const discountPercent = discount?.discountPercent ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        slug: product.slug,
        image: product.image_urls?.[0],
      });
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full relative">
        {/* Image with discount badge */}
        <div className="w-full aspect-square bg-neutral-100 overflow-hidden relative">
          <img
            src={product.image_urls?.[0] || '/placeholder.png'}
            alt={product.name}
            className="object-cover w-full h-full"
          />
          {discount && (
            <div className="absolute top-2 right-2 bg-status-danger-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
              {discount.discountPercent}% OFF
            </div>
          )}
        </div>

        <div className="p-2.5 sm:p-4 flex flex-col flex-1">
          <h3 className="font-medium text-neutral-900 line-clamp-2 text-xs sm:text-sm leading-snug">{product.name}</h3>
          {/* Description hidden on mobile — too cramped in 2-col grid */}
          <p className="hidden sm:block text-xs text-neutral-600 line-clamp-2 mt-1 flex-1">{product.description}</p>

          {/* Price section with discount */}
          <div className="mt-2 sm:mt-4 mb-2 sm:mb-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-brand-primary-600">
                {formatCurrency(Number(product.price))}
              </span>
              {discount && (
                <span className="text-xs sm:text-sm text-neutral-500 line-through">
                  {formatCurrency(discount.originalPrice / 100)}
                </span>
              )}
            </div>
            {savingsInCents > 0 && (
              <div className="text-xs font-medium text-status-success-700">
                Save {formatCurrency(savingsInCents / 100)}
              </div>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
            <div />
            {product.stock_quantity === 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-status-danger-700 bg-status-danger-50 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                <CircleSlash size={12} strokeWidth={1.5} />
                <span className="hidden sm:inline">Out of Stock</span>
                <span className="sm:hidden">OOS</span>
              </div>
            )}
            {product.stock_quantity > 0 && product.stock_quantity <= 3 && (
              <div className="text-xs font-medium text-status-warning-700 bg-status-warning-50 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                Only {product.stock_quantity} left
              </div>
            )}
          </div>

          <div onClick={(e) => e.preventDefault()} className="mt-auto">
            {!inStock ? (
              <button
                disabled
                className="w-full rounded-md font-medium h-9 sm:h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
              >
                <CircleSlash size={14} strokeWidth={1.5} />
                Out of Stock
              </button>
            ) : isInCart ? (
              <button
                disabled
                className="w-full rounded-md font-medium h-9 sm:h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-black bg-status-success-700 text-white cursor-not-allowed"
              >
                <CheckCircle2 size={14} strokeWidth={1.5} />
                In Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full rounded-md font-medium h-9 sm:h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-black bg-brand-primary-700 text-white hover:bg-brand-primary-600 transition-colors"
              >
                Add to Cart
                <ShoppingCart size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
