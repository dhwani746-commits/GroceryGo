import { Product } from '@/lib/store/products';

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
