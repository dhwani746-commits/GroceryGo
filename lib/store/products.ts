import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
  category: string | null;
}

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProducts: (products: Product[]) => void;
}

export const useProducts = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  addProducts: (products) =>
    set((state) => {
      const ids = new Set(state.products.map((p) => p.id));
      const newProducts = products.filter((p) => !ids.has(p.id));
      return { products: [...state.products, ...newProducts] };
    }),
}));
