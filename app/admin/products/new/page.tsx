'use client';

import { useState } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { BulkProductImport } from '@/components/admin/BulkProductImport';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { Plus, FileSpreadsheet, Keyboard } from 'lucide-react';

type TabOption = 'single' | 'bulk';

export default function NewProductPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('single');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AdminBreadcrumbs
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: 'Create New' },
        ]}
      />

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-primary-100 rounded-lg">
            <Plus size={24} className="text-brand-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Create New Product</h1>
        </div>
        <p className="text-neutral-600 ml-[52px]">
          Add products to your store catalog manually or in bulk via an Excel spreadsheet.
        </p>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex border-b border-neutral-200 mb-6 ml-[52px]">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 pb-3.5 pt-2 px-4 font-semibold text-sm transition-all duration-200 border-b-2 active:scale-95 ${
            activeTab === 'single'
              ? 'text-brand-primary-600 border-brand-primary-600'
              : 'text-neutral-500 border-transparent hover:text-neutral-900'
          }`}
        >
          <Keyboard size={16} />
          Single Product
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 pb-3.5 pt-2 px-4 font-semibold text-sm transition-all duration-200 border-b-2 active:scale-95 ${
            activeTab === 'bulk'
              ? 'text-brand-primary-600 border-brand-primary-600'
              : 'text-neutral-500 border-transparent hover:text-neutral-900'
          }`}
        >
          <FileSpreadsheet size={16} />
          Bulk Excel Import
        </button>
      </div>

      {/* Content Rendering */}
      <div className="ml-[52px]">
        {activeTab === 'single' ? (
          <ProductForm mode="create" />
        ) : (
          <BulkProductImport />
        )}
      </div>
    </div>
  );
}
