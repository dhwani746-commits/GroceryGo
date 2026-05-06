'use client';

import { ProductForm } from '@/components/admin/ProductForm';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Package, Plus } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: 'Create New' },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-primary-100 rounded-lg">
            <Plus size={24} className="text-brand-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Create New Product</h1>
        </div>
        <p className="text-neutral-600 ml-[52px]">
          Add a new product to your store. Fill in the details below.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
