'use client';

import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus, CircleSlash, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQuantity } = useCart();
  const inStock = product.stock_quantity > 0;
  const cartItem = items.find((i) => i.id === product.id);
  const isInCart = !!cartItem;

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

  const decreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity > 1 ? cartItem.quantity - 1 : 1;
      updateQuantity(product.id, newQty);
    }
  };

  const increaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity < product.stock_quantity ? cartItem.quantity + 1 : cartItem.quantity;
      updateQuantity(product.id, newQty);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
        {/* Square image — consistent grid alignment */}
        <div className="w-full aspect-square bg-neutral-100 overflow-hidden">
          <img
            src={product.image_urls?.[0] || '/placeholder.png'}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="p-2.5 sm:p-4 flex flex-col flex-1">
          <h3 className="font-medium text-neutral-900 line-clamp-2 text-xs sm:text-sm leading-snug">{product.name}</h3>
          {/* Description hidden on mobile — too cramped in 2-col grid */}
          <p className="hidden sm:block text-xs text-neutral-600 line-clamp-2 mt-1 flex-1">{product.description}</p>

          <div className="mt-2 sm:mt-4 mb-2 sm:mb-3 flex items-center justify-between gap-1">
            <span className="text-sm sm:text-base font-semibold text-brand-primary-600">{formatCurrency(Number(product.price))}</span>
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

          {inStock && (
            <div onClick={(e) => e.preventDefault()} className="mt-auto">
              {isInCart ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <button onClick={decreaseQty} className="p-1 border border-neutral-300 rounded-md bg-white hover:bg-neutral-100 text-neutral-700" aria-label="Decrease quantity">
                      <Minus size={14} strokeWidth={1.5} />
                    </button>
                    <span className="flex-1 text-center font-medium text-neutral-900 text-sm">{cartItem?.quantity}</span>
                    <button onClick={increaseQty} className="p-1 border border-neutral-300 rounded-md bg-white hover:bg-neutral-100 text-neutral-700" aria-label="Increase quantity">
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    disabled
                    className="w-full rounded-md font-medium h-9 sm:h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-black bg-status-success-700 text-white cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} strokeWidth={1.5} />
                    In Cart
                  </button>
                </div>
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
          )}
        </div>
      </div>
    </Link>
  );
}
