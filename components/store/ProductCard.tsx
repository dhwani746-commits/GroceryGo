'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/store/cart';
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
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, updateQuantity } = useCart();
  const inStock = product.stock_quantity > 0;
  const cartItem = items.find((i) => i.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0 && inStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        slug: product.slug,
        image: product.image_urls?.[0],
      });
      setQuantity(1); // Reset local quantity after adding
    }
  };

  const decreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity > 1 ? cartItem.quantity - 1 : 1;
      updateQuantity(product.id, newQty);
    } else {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    }
  };

  const increaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity < product.stock_quantity ? cartItem.quantity + 1 : cartItem.quantity;
      updateQuantity(product.id, newQty);
    } else {
      setQuantity((q) => (q < product.stock_quantity ? q + 1 : q));
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="bg-neutral-0 rounded-lg border border-neutral-200 hover:shadow-lg transition overflow-hidden flex flex-col h-full">
        <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
          <img 
            src={product.image_urls?.[0] || '/placeholder.png'} 
            alt={product.name} 
            className="object-cover w-full h-full" 
          />
        </div>
        
        <div className="p-4 flex flex-col h-full">
          <h3 className="font-medium text-neutral-900 truncate text-sm">{product.name}</h3>
          <p className="text-xs text-neutral-600 line-clamp-2 mt-1 flex-1">{product.description}</p>
          
          <div className="flex justify-between items-center mt-4 mb-4">
            <span className="text-base font-semibold text-brand-primary-600">₹ {parseFloat(product.price).toFixed(2)}</span>
            {product.stock_quantity === 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-status-danger-700 bg-status-danger-50 px-2 py-1 rounded-sm">
                <CircleSlash size={14} strokeWidth={1.5} />
                Out of Stock
              </div>
            )}
            {product.stock_quantity > 0 && product.stock_quantity <= 3 && (
              <div className="text-xs font-medium text-status-warning-700 bg-status-warning-50 px-2 py-1 rounded-sm">
                Only {product.stock_quantity} left
              </div>
            )}
          </div>

          {inStock && (
            <div onClick={(e) => e.preventDefault()} className="space-y-2">
              <div className="flex items-center gap-1">
                <button onClick={decreaseQty} className="p-1 border border-neutral-300 rounded-md bg-neutral-0 hover:bg-neutral-100 text-neutral-700" aria-label="Decrease quantity">
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <span className="flex-1 text-center font-medium text-neutral-900 text-sm">{cartItem?.quantity || quantity}</span>
                <button onClick={increaseQty} className="p-1 border border-neutral-300 rounded-md bg-neutral-0 hover:bg-neutral-100 text-neutral-700" aria-label="Increase quantity">
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`w-full rounded-md font-medium transition h-10 flex items-center justify-center gap-2 text-sm ${
                  isInCart
                    ? 'border border-solid border-black rounded-md bg-status-success-700 text-white cursor-not-allowed text-md'
                    : 'border border-solid border-black rounded-md bg-brand-primary-700 text-white hover:bg-brand-primary-600'
                }`}
              >
                {isInCart ? (
                  <>
                    <CheckCircle2 size={16} strokeWidth={1.5} />
                      In Cart
                  </>
                ) : (
                  <>
                      Add to Cart
                    <ShoppingCart size={16} strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
