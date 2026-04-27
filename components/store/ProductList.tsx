'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProducts } from '@/lib/store/products';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();
  const setStoreProducts = useProducts((state) => state.setProducts);

  useEffect(() => {
    setLoading(true);

    async function fetchProducts() {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('id, name, slug, price, description, image_urls, stock_quantity')
          .eq('is_visible', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(30);

        if (fetchError) throw fetchError;
        setProducts(data || []);
        setStoreProducts(data || []);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [setStoreProducts]);

  if (loading) return <div className="text-center py-8 text-neutral-600">Loading products...</div>;
  if (error) return <div className="text-center py-8 text-status-danger-600">{error}</div>;
  if (!products.length) return <div className="text-center py-8 text-neutral-600">No products available</div>;

  return (
    <div className="flex flex-row overflow-x-auto gap-4 lg:grid lg:grid-cols-4 lg:gap-6 pb-2">
      {products.map((product) => (
        <div key={product.id} className="flex-shrink-0 w-64 md:w-72 lg:w-auto">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
