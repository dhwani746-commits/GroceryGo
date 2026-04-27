'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Pencil, Trash2, Eye, EyeOff, Search, ArrowLeft, ArrowRight, ImagePlus, Boxes, CircleSlash, AlertCircle, Filter, X } from 'lucide-react';

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  is_visible: boolean;
  image_urls?: string[];
  category?: Category;
  created_at: string;
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'out_of_stock' | 'low_stock'>('all');
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Debounced Filter States
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete the product. Please try again later.');
      }
    } catch (err) {
      toast.error('A network error occurred while deleting the product.');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === id ? { ...p, is_visible: !currentVisibility } : p
        ));
        toast.success(`Product marked as ${!currentVisibility ? 'active' : 'inactive'}`);
      } else {
        toast.error('Failed to update product visibility. Please try again.');
      }
    } catch (err) {
      toast.error('A network error occurred while updating the product.');
    }
  };

  // Handle Debouncing for Search and Prices
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  // Extract unique categories for the dropdown
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category?.name).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query (Debounced)
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      if (!matchesSearch) return false;
      
      // 2. Overview Card Filters
      if (stockFilter === 'out_of_stock' && product.stock_quantity !== 0) return false;
      if (stockFilter === 'low_stock' && (product.stock_quantity === 0 || product.stock_quantity > 10)) return false;

      // 3. Category Filter
      if (selectedCategory !== 'all' && product.category?.name !== selectedCategory) return false;

      // 4. Status Filter
      if (statusFilter === 'active' && !product.is_visible) return false;
      if (statusFilter === 'inactive' && product.is_visible) return false;

      // 5. Price Filters (Debounced)
      const productPrice = parseFloat(product.price);
      if (debouncedMinPrice && productPrice < parseFloat(debouncedMinPrice)) return false;
      if (debouncedMaxPrice && productPrice > parseFloat(debouncedMaxPrice)) return false;

      return true;
    });
  }, [products, debouncedSearch, stockFilter, selectedCategory, statusFilter, debouncedMinPrice, debouncedMaxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when any search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, stockFilter, selectedCategory, statusFilter, debouncedMinPrice, debouncedMaxPrice]);

  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length;

  if (loading) return <div className="p-6 text-neutral-500">Loading products...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-medium text-neutral-900">Product Details</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-md hover:bg-brand-primary-500 transition text-base font-medium h-[44px]"
        >
          + Add Product
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Catalog Card */}
        <div
          className={`bg-white shadow rounded-lg p-6 flex items-center justify-between cursor-pointer transition border ${stockFilter === 'all' ? 'border-brand-primary-500 ring-1 ring-brand-primary-500' : 'border-transparent hover:border-neutral-300'}`}
          onClick={() => setStockFilter('all')}
        >
          <div>
            <div className="text-sm text-neutral-700 font-bold uppercase">Catalog</div>
            <div className="mt-2 text-2xl font-bold text-brand-primary-600">{totalProducts}</div>
          </div>
          <div className="flex items-center">
            <div className="bg-brand-primary-50 w-10 h-10 rounded-full flex items-center justify-center">
              <Boxes className="text-brand-primary-600" size={20} />
            </div>
          </div>
        </div>

        {/* Out of Stock Card */}
        <div
          className={`bg-white shadow rounded-lg p-6 flex items-center justify-between cursor-pointer transition border ${stockFilter === 'out_of_stock' ? 'border-neutral-500 ring-1 ring-neutral-500' : 'border-transparent hover:border-neutral-300'}`}
          onClick={() => setStockFilter('out_of_stock')}
        >
          <div>
            <div className="text-sm text-neutral-700 font-bold uppercase">Out of Stock</div>
            <div className="mt-2 text-2xl font-bold text-neutral-500">{outOfStockCount}</div>
          </div>
          <div className="flex items-center">
            <div className="bg-neutral-100 w-10 h-10 rounded-full flex items-center justify-center">
              <CircleSlash className="text-neutral-500" size={20} />
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div
          className={`bg-white shadow rounded-lg p-6 flex items-center justify-between cursor-pointer transition border ${stockFilter === 'low_stock' ? 'border-status-warning-500 ring-1 ring-status-warning-500' : 'border-transparent hover:border-neutral-300'}`}
          onClick={() => setStockFilter('low_stock')}
        >
          <div>
            <div className="text-sm text-neutral-700 font-bold uppercase">Low Stock</div>
            <div className="mt-2 text-2xl font-bold text-status-warning-500">{lowStockCount}</div>
          </div>
          <div className="flex items-center">
            <div className="bg-status-warning-50 w-10 h-10 rounded-full flex items-center justify-center">
              <AlertCircle className="text-status-warning-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent text-base text-neutral-700 placeholder-neutral-500"
            />
            <Search size={20} strokeWidth={1.5} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md font-medium transition h-10 ${showFilters ? 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-700' : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}
          >
            <Filter size={18} strokeWidth={1.5} />
            Filters
            {(selectedCategory !== 'all' || statusFilter !== 'all' || minPrice || maxPrice) && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
            
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 text-base text-neutral-700"
              >
                <option value="all">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 text-base text-neutral-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-neutral-700">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 text-base text-neutral-700 placeholder-neutral-400"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 text-base text-neutral-700 placeholder-neutral-400"
                />
                
                {/* Clear Filters Button (Only shows if something is selected) */}
                {(selectedCategory !== 'all' || statusFilter !== 'all' || minPrice || maxPrice) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setStatusFilter('all');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="ml-2 p-2 text-neutral-500 hover:text-status-danger-600 hover:bg-status-danger-50 rounded-md transition"
                    title="Clear filters"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-neutral-200 rounded-lg space-y-4">
          <div className="p-4 bg-neutral-100 rounded-full">
            <Search size={24} strokeWidth={1.5} className="text-neutral-500" />
          </div>
          <div className="text-center">
            <p className="text-base text-neutral-700 font-medium">No products found</p>
            <p className="text-sm text-neutral-500 mt-1">Try adjusting your search or add a new product.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-neutral-700">Product</th>
                  <th className="px-6 py-4 text-sm font-medium text-neutral-700">Category</th>
                  <th className="px-6 py-4 text-sm font-medium text-neutral-700">Price</th>
                  <th className="px-6 py-4 text-sm font-medium text-neutral-700">Stock</th>
                  <th className="px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                  <th className="pr-20 py-4 text-sm font-medium text-neutral-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedProducts.map(product => {
                  const outOfStock = product.stock_quantity === 0;
                  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                            {product.image_urls && product.image_urls.length > 0 ? (
                              <Image
                                src={product.image_urls[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <ImagePlus size={20} strokeWidth={1.5} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-base text-neutral-900 font-medium truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base text-neutral-700">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-price text-neutral-900">
                        ₹ {parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-base text-neutral-700">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          {!product.is_visible ? (
                            <span className="px-2 py-1 rounded-sm text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                              Inactive
                            </span>
                          ) : outOfStock ? (
                            <span className="px-2 py-1 rounded-sm text-xs font-medium bg-neutral-100 text-neutral-500">
                              Out of Stock
                            </span>
                          ) : lowStock ? (
                            <span className="px-2 py-1 rounded-sm text-xs font-medium bg-status-warning-50 text-status-warning-700 border border-status-warning-100">
                              Low in Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-sm text-xs font-medium bg-status-success-50 text-status-success-700">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-neutral-500 hover:text-brand-primary-600 hover:bg-brand-primary-50 rounded-md transition flex items-center justify-center min-w-[44px] min-h-[44px]"
                            title="Edit"
                          >
                            <Pencil size={20} strokeWidth={1.5} />
                          </Link>
                          <button
                            onClick={() => toggleVisibility(product.id, product.is_visible)}
                            className={`p-2 rounded-md transition flex items-center justify-center min-w-[44px] min-h-[44px] ${product.is_visible
                              ? 'text-neutral-500 hover:text-status-warning-700 hover:bg-status-warning-50'
                              : 'text-neutral-500 hover:text-status-success-700 hover:bg-status-success-50'
                              }`}
                            title={product.is_visible ? "Mark Inactive" : "Mark Active"}
                          >
                            {product.is_visible ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-2 text-neutral-500 hover:text-status-danger-700 hover:bg-status-danger-50 rounded-md transition flex items-center justify-center min-w-[44px] min-h-[44px]"
                            title="Delete"
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-neutral-200">
              <span className="text-sm text-neutral-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <div className="flex items-center px-4 font-medium text-neutral-700">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-45">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-status-danger-700">
                <AlertCircle size={24} strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-neutral-900">Delete Product</h3>
              </div>
              <p className="text-base text-neutral-700">
                Are you sure you want to delete <span className="font-semibold text-neutral-900">{productToDelete.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100 rounded-md font-medium transition h-[44px] min-w-[80px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-status-danger-50 text-status-danger-700 border border-status-danger-100 hover:bg-status-danger-100 rounded-md font-medium transition h-[44px] min-w-[80px] flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
