'use client';

import { Header } from '@/components/Header';
import { useCart } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleProceedToCheckout = async () => {
    setIsCheckingOut(true);
    await router.push('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full mt-32">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 text-lg mb-6">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-lg text-white bg-brand-accent-500 hover:bg-brand-primary-500 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg p-4 flex gap-4"
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                    <p className="text-brand-primary-600 font-bold mt-1">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="p-1 hover:bg-neutral-100 rounded transition"
                      >
                        <Minus size={16} className="text-neutral-600" />
                      </button>
                      <span className="text-sm font-medium px-3">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-neutral-100 rounded transition"
                      >
                        <Plus size={16} className="text-neutral-600" />
                      </button>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-status-danger-600 hover:text-status-danger-700 p-2 hover:bg-status-danger-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 h-fit">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Items ({getTotalItems()})</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-neutral-900 mb-6">
                <span>Total</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isCheckingOut
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-brand-primary-600 text-white hover:bg-brand-primary-700'
                }`}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full mt-3 py-3 rounded-lg font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
