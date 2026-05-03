'use client';

import { useCart } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartOverlay({ isOpen, onClose }: CartOverlayProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleProceedToCheckout = async () => {
    setIsCheckingOut(true);
    onClose();
    await router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={onClose}
        />
      )}

      {/* Overlay */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            Your Cart
            {items.length > 0 && (
              <span className="text-lg text-neutral-500 font-medium">({getTotalItems()} items)</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition rounded-md p-2 hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ height: 'calc(100% - 190px)' }}>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-neutral-500 text-lg">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="mt-5 p-4 rounded-lg text-white bg-brand-accent-500  hover:bg-brand-primary-500 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg p-3"
                >
                  <div className="flex gap-3">
                    
                    {/* Left Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-md flex-shrink-0"
                      />
                    )}

                    {/* Right Content */}
                    <div className="flex flex-col justify-between w-full">

                      {/* Top Row: Name + Delete */}
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-neutral-900 text-sm line-clamp-2">
                          {item.name}
                        </h3>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-black hover:text-white transition flex-shrink-0 p-2 rounded hover:bg-status-danger-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Quantity Controls Below */}
                      <div className="flex items-center mt-2">
                        {/* Minus Button */}
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-status-danger-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} strokeWidth={1.5} />
                        </button>

                        {/* Quantity Box */}
                        <span className="w-10 h-10 flex items-center justify-center border-t border-b border-gray-300 text-black font-medium text-sm">
                          {item.quantity}
                        </span>

                        {/* Plus Button */}
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-status-success-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mt-2 text-right text-md text-neutral-900 font-bold">
                        ₹  {(
                          (typeof item.price === "string"
                            ? parseFloat(item.price) : item.price) * item.quantity
                        ).toFixed(2)}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-red-700 font-bold text-lg">
                <span className="font-bold">SUBTOTAL</span>
                <span className="font-semibold">₹  &nbsp; {getTotalPrice().toFixed(2)}</span>
              </div>
              {/* <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span className="font-semibold text-orange-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div> */}
            </div>
            <button
              onClick={handleProceedToCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isCheckingOut ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
