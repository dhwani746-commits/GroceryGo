import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
  slug: string;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  // Flips to true once persist middleware has read from localStorage.
  // Always false during SSR / before first client render.
  _hasHydrated: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  clearCart: () => void; // alias for clear(), used by checkout page
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setHasHydrated: (value: boolean) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),
      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const p = Number(item.price);
          return total + p * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-store',
      // Called once localStorage has been read and state merged.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
