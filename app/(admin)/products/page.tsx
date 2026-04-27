'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { downloadExcelTemplate, parseExcelFile, type ProductRow } from '@/lib/utils/excel-utils';
import { Plus, Upload, Download, X } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<
    (ProductRow & { image_urls_array: string[] })[]
  >([]);
  const [formData, setFormData] = useState<ProductRow>({
    name: '',
    slug: '',
    price: '',
    category: '',
    description: '',
    image_urls: '',
    stock_quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const supabase = createClient();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stock_quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddProductToList = () => {
    if (!formData.name || !formData.slug || !formData.price) {
      setMessage('Please fill in name, slug, and price');
      return;
    }

    const imageArray = formData.image_urls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    setProducts((prev) => [
      ...prev,
      {
        ...formData,
        image_urls_array: imageArray,
      },
    ]);

    setFormData({
      name: '',
      slug: '',
      price: '',
      category: '',
      description: '',
      image_urls: '',
      stock_quantity: 0,
    });
    setMessage('');
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileLoading(true);
      const parsedData = await parseExcelFile(file);
      setProducts(
        parsedData.map((item) => ({
          ...item,
          image_urls_array: item.image_urls
            .split(',')
            .map((url) => url.trim())
            .filter(Boolean),
        }))
      );
      setMessage(`Loaded ${parsedData.length} products from file`);
    } catch (err) {
      setMessage(`Error parsing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFileLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (products.length === 0) {
      setMessage('Please add products to upload');
      return;
    }

    setLoading(true);
    try {
      const productsToInsert = products.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        category: p.category,
        description: p.description,
        image_urls: p.image_urls_array,
        stock_quantity: p.stock_quantity,
        is_visible: true,
        is_deleted: false,
      }));

      const { error } = await supabase.from('products').insert(productsToInsert);

      if (error) throw error;

      setMessage(`Successfully uploaded ${products.length} products!`);
      setProducts([]);
    } catch (err) {
      setMessage(`Error uploading products: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Management</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Single Product Form */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} /> Add Single Product
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />

              <input
                type="text"
                name="slug"
                placeholder="Product Slug (url-friendly)"
                value={formData.slug}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                step="0.01"
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20"
              />

              <input
                type="text"
                name="image_urls"
                placeholder="Image URLs (comma separated)"
                value={formData.image_urls}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />

              <input
                type="number"
                name="stock_quantity"
                placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />

              <button
                onClick={handleAddProductToList}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm"
              >
                Add to List
              </button>
            </div>
          </div>

          {/* Bulk Upload Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} /> Bulk Upload
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleUploadExcel}
                  disabled={fileLoading}
                  className="w-full cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-2">Upload Excel file to add multiple products</p>
              </div>

              <button
                onClick={() => downloadExcelTemplate()}
                className="w-full bg-accent-500 text-white py-2 rounded-lg hover:bg-accent-600 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download Template
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Products in List:</span>
                <span className="font-bold text-gray-900">{products.length}</span>
              </div>

              <button
                onClick={handleBulkUpload}
                disabled={loading || products.length === 0}
                className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                  loading || products.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Uploading...' : `Upload ${products.length} Products`}
              </button>

              {products.length > 0 && (
                <button
                  onClick={() => setProducts([])}
                  className="w-full py-2 rounded-lg font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  Clear List
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3">₹{parseFloat(product.price).toFixed(2)}</td>
                      <td className="px-4 py-3">{product.stock_quantity}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
