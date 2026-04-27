'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
  image_urls: string[];
  is_visible: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8 text-red-600">Product not found</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id,
          image_urls: product.image_urls,
          is_visible: product.is_visible,
        }}
      />
    </div>
  );
}
