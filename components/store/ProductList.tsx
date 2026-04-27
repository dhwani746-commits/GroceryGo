'use client';

import { useEffect, useState } from 'react';

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

import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '@/lib/api/products';

export function ProductList() {
  const setStoreProducts = useProducts((state) => state.setProducts);
  
  const { data, isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  const products = data || [];
  const error = fetchError ? 'Failed to load products' : '';

  useEffect(() => {
    if (data) {
      setStoreProducts(data);
    }
  }, [data, setStoreProducts]);

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
