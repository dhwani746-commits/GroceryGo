import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
