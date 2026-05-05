import { Product } from '@/lib/store/products';

export interface ProductPage {
  data: Product[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json = await res.json();
  return json.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`/api/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const json = await res.json();
  return json.data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search products');
  const json = await res.json();
  return json.data;
}

/** Paginated fetch — used by the Browse All / Search page */
export async function fetchProductsPage(
  query: string,
  page: number,
  perPage = 12,
): Promise<ProductPage> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (query.trim()) params.set('q', query.trim());
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}
