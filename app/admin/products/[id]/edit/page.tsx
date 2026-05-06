'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Package, Pencil, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  stock_quantity: number;
  category: string;
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

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Product not found</h2>
            <p className="text-neutral-600 mb-4">The product you're trying to edit doesn't exist.</p>
            <a
              href="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition"
            >
              Back to Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: product.name },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-primary-100 rounded-lg">
            <Pencil size={24} className="text-brand-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
            <p className="text-sm text-neutral-500">ID: {product.id.slice(0, 8)}...</p>
          </div>
        </div>
        <p className="text-neutral-600 ml-[52px]">
          Update the details for <span className="font-medium text-neutral-900">{product.name}</span>
        </p>
      </div>

      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          original_price: product.original_price ? String(product.original_price) : '',
          stock_quantity: String(product.stock_quantity),
          category: typeof product.category === 'string' ? product.category : product.category || '',
          image_urls: product.image_urls,
          is_visible: product.is_visible,
        }}
      />
    </div>
  );
}
