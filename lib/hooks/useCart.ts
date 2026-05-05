'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stockCount: number;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Update quantity if item exists
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              product.stockCount
            );
            
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          } else {
            // Add new item
            return {
              items: [...state.items, { product, quantity: Math.min(quantity, product.stockCount) }],
            };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const item = state.items.find((item) => item.product.id === productId);
          if (!item) return state;

          const validQuantity = Math.min(Math.max(0, quantity), item.product.stockCount);
          
          if (validQuantity === 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: validQuantity }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'plastikart-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCart() {
  const store = useCartStore();
  
  return {
    items: store.items,
    isLoading: store.isLoading,
    subtotal: store.getSubtotal(),
    itemCount: store.getItemCount(),
    addToCart: store.addItem,
    removeFromCart: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
}
