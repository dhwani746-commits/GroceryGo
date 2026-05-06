'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Package,
  Tag,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  Hash,
  ChevronDown,
  Plus,
} from 'lucide-react';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    original_price?: string;
    stock_quantity: string;
    category: string;
    image_urls: string[];
    is_visible: boolean;
  };
  mode: 'create' | 'edit';
}

interface FormErrors {
  name?: string;
  price?: string;
  original_price?: string;
  stock_quantity?: string;
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    original_price: initialData?.original_price || '',
    stock_quantity: initialData?.stock_quantity || '',
    category: initialData?.category || '',
    image_urls: initialData?.image_urls?.join('\n') || '',
    is_visible: initialData?.is_visible !== false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    initialData?.image_urls || []
  );

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setCategoryDropdownOpen(false);
      }
    };
    
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [categoryDropdownOpen]);

  // Calculate discount percentage
  const discountPercent = form.original_price && form.price && parseFloat(form.original_price) > parseFloat(form.price)
    ? Math.round(((parseFloat(form.original_price) - parseFloat(form.price)) / parseFloat(form.original_price)) * 100)
    : null;

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      name,
      slug: mode === 'create' ? generateSlug(name) : prev.slug,
    }));
    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
  };

  // Update image previews when image_urls changes
  useEffect(() => {
    const urls = form.image_urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && url.startsWith('http'));
    setImagePreviewUrls(urls);
  }, [form.image_urls]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (form.original_price && parseFloat(form.original_price) <= parseFloat(form.price || '0')) {
      newErrors.original_price = 'Original price must be higher than selling price';
    }

    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = form.image_urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price,
        original_price: form.original_price || null,
        stock_quantity: form.stock_quantity,
        category: form.category || null,
        image_urls: imageUrls,
        is_visible: form.is_visible,
      };

      if (mode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create product');
        }
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        const res = await fetch(`/api/admin/products/${initialData?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update product');
        }
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setForm(prev => ({ ...prev, category: cat }));
    setCategoryDropdownOpen(false);
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const trimmed = newCategoryName.trim();
    
    // Check if category already exists
    if (categories.includes(trimmed)) {
      setForm(prev => ({ ...prev, category: trimmed }));
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      return;
    }
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      
      if (res.ok) {
        setCategories(prev => [...prev, trimmed].sort());
        setForm(prev => ({ ...prev, category: trimmed }));
        toast.success(`Category "${trimmed}" created`);
      } else if (res.status === 409) {
        // Category already exists
        setForm(prev => ({ ...prev, category: trimmed }));
      } else {
        toast.error('Failed to create category');
      }
    } catch {
      toast.error('Failed to create category');
    }
    
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const removeImage = (index: number) => {
    const urls = form.image_urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    urls.splice(index, 1);
    setForm(prev => ({ ...prev, image_urls: urls.join('\n') }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Basic Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-brand-primary-200 focus:border-brand-primary-500'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  URL Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full pl-20 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-500 transition"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Auto-generated from product name. Used in the product URL.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your product..."
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-500 transition resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-neutral-500">
                    Provide detailed information about the product
                  </p>
                  <span className="text-xs text-neutral-400">
                    {form.description.length} chars
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Pricing</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={form.price}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, price: e.target.value }));
                        if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                      }}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        errors.price
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-neutral-300 focus:ring-brand-primary-200 focus:border-brand-primary-500'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={form.original_price}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, original_price: e.target.value }));
                        if (errors.original_price) setErrors(prev => ({ ...prev, original_price: undefined }));
                      }}
                      placeholder="Higher price for discount display"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        errors.original_price
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-neutral-300 focus:ring-brand-primary-200 focus:border-brand-primary-500'
                      }`}
                    />
                  </div>
                  {errors.original_price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.original_price}
                    </p>
                  )}
                </div>
              </div>

              {/* Discount Preview */}
              {discountPercent !== null && discountPercent > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {discountPercent}% discount will be displayed
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Customers will see the original price crossed out with the discount percentage
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Media</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Image URLs
                </label>
                <textarea
                  value={form.image_urls}
                  onChange={(e) => setForm(prev => ({ ...prev, image_urls: e.target.value }))}
                  rows={3}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-500 transition font-mono text-sm"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Enter one image URL per line. First image will be used as the main product image.
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Preview ({imagePreviewUrls.length} image{imagePreviewUrls.length !== 1 ? 's' : ''})
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-neutral-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-brand-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Status</h2>
              </div>
            </div>
            <div className="p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm(prev => ({ ...prev, is_visible: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary-600"></div>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-neutral-900">
                    {form.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {form.is_visible
                      ? 'Product is visible in the store'
                      : 'Product is hidden from customers'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Inventory</h2>
              </div>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, stock_quantity: e.target.value }));
                      if (errors.stock_quantity) setErrors(prev => ({ ...prev, stock_quantity: undefined }));
                    }}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.stock_quantity
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-neutral-300 focus:ring-brand-primary-200 focus:border-brand-primary-500'
                    }`}
                  />
                </div>
                {errors.stock_quantity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.stock_quantity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-brand-primary-600" />
                <h2 className="font-semibold text-neutral-900">Category</h2>
              </div>
            </div>
            <div className="p-6">
              {!isAddingNewCategory ? (
                <div className="relative category-dropdown">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-500 transition bg-white"
                  >
                    <span className={form.category ? 'text-neutral-900' : 'text-neutral-400'}>
                      {form.category || 'Select a category...'}
                    </span>
                    <ChevronDown size={18} className={`text-neutral-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {categoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Existing categories */}
                      {categories.length > 0 && (
                        <div className="py-1">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition ${
                                form.category === cat ? 'bg-brand-primary-50 text-brand-primary-700 font-medium' : 'text-neutral-700'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Add new option */}
                      <div className="border-t border-neutral-100 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewCategory(true);
                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-brand-primary-600 hover:bg-brand-primary-50 transition flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Create new category
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-1 text-xs text-neutral-500">
                    {categories.length} categories available
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    New Category Name
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-200 focus:border-brand-primary-500 transition"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={!newCategoryName.trim()}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-brand-primary-600 text-white text-sm rounded-lg hover:bg-brand-primary-700 disabled:opacity-50 transition"
                      >
                        <Plus size={16} />
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryName('');
                        }}
                        className="px-3 py-2 bg-white text-neutral-700 border border-neutral-300 text-sm rounded-lg hover:bg-neutral-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                <>
                  <CheckCircle2 size={18} />
                  Create Product
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Update Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 font-medium transition"
            >
              <ArrowLeft size={18} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
