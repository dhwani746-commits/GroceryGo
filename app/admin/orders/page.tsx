'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Package,
  MapPin,
  Phone,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { TableSkeleton, MobileCardSkeleton, FilterSkeleton } from '@/components/admin/SkeletonLoading';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface AdminOrder {
  id: string;
  customer_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  delivery_address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
  order_items: OrderItem[];
  profiles?: { full_name: string; phone: string | null } | null;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending',    label: 'Pending' },
  { value: 'paid',       label: 'Paid' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
];

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-status-warning-100 text-status-warning-800 border-status-warning-200',
  paid:       'bg-status-success-100 text-status-success-800 border-status-success-200',
  confirmed:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  cancelled:  'bg-status-danger-100 text-status-danger-800 border-status-danger-200',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  paid:       { label: 'Paid',       color: 'text-green-800',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  confirmed:  { label: 'Confirmed',  color: 'text-green-800',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  processing: { label: 'Processing', color: 'text-blue-800',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  shipped:    { label: 'Shipped',    color: 'text-purple-800', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  delivered:  { label: 'Delivered',  color: 'text-green-800',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-800',    bg: 'bg-red-100',    dot: 'bg-red-500' },
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  paid:       ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pageSize = 15;
  const totalPages = Math.ceil(total / pageSize);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setOrders(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Order status updated to "${newStatus}"`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Client-side name search and date filter
  const filtered = orders.filter((o) => {
    // Name/ID search
    if (search.trim()) {
      const searchMatch = 
        (o.profiles?.full_name?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());
      if (!searchMatch) return false;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) return false;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (orderDate > toDate) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden break-words">
      <AdminBreadcrumbs items={[{ label: 'Orders' }]} />
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={22} className="text-brand-primary-600" />
            Orders
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: Search and Status */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Row 2: Date Range */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              placeholder="From"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              placeholder="To"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
        {loading ? (
          <TableSkeleton rows={10} />
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const isExpanded = expandedId === order.id;
                    const nextStatuses = NEXT_STATUSES[order.status] ?? [];
                    const badgeCls = STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';

                    return (
                      <Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-mono text-xs font-semibold text-gray-700 hover:text-brand-primary-600 hover:underline"
                            >
                              #{order.id.split('-')[0].toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {order.profiles?.full_name ?? order.delivery_address.name}
                            </p>
                            <p className="text-xs text-gray-400">{order.delivery_address.city}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                              >
                                View <ArrowRight size={12} />
                              </Link>
                              {nextStatuses.length > 0 ? (
                                <div className="relative group">
                                  <button
                                    disabled={updatingId === order.id}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition disabled:opacity-50"
                                  >
                                    {updatingId === order.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <>Update <ChevronDown size={12} /></>
                                    )}
                                  </button>
                                  {/* Dropdown with color-coded dots */}
                                  <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                                    {nextStatuses.map((s) => (
                                      <button
                                        key={s}
                                        onClick={(e) => { updateStatus(order.id, s); }}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 capitalize first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                                      >
                                        <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s]?.dot ?? 'bg-gray-300'}`} />
                                        Mark as {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">—</span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {isExpanded && (
                          <tr key={`${order.id}-expanded`} className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Items */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Package size={12} /> Items
                                  </p>
                                  <ul className="space-y-1.5">
                                    {order.order_items.map((item) => (
                                      <li key={item.id} className="flex justify-between text-sm text-gray-700">
                                        <span>{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                                        <span className="font-medium">{formatCurrency(item.line_total)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  {order.discount_amount > 0 && (
                                    <p className="text-xs text-status-success-700 mt-2 font-medium">
                                      Promo discount: −{formatCurrency(order.discount_amount)}
                                    </p>
                                  )}
                                </div>
                                {/* Address */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <MapPin size={12} /> Delivery Address
                                  </p>
                                  <address className="text-sm text-gray-700 not-italic leading-relaxed">
                                    <p className="font-medium">{order.delivery_address.name}</p>
                                    <p className="flex items-center gap-1 text-gray-500">
                                      <Phone size={11} /> {order.delivery_address.phone}
                                    </p>
                                    <p className="mt-1">{order.delivery_address.line1}</p>
                                    {order.delivery_address.line2 && <p>{order.delivery_address.line2}</p>}
                                    <p>{order.delivery_address.city}, {order.delivery_address.state} — {order.delivery_address.pincode}</p>
                                  </address>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 min-w-0">
              {filtered.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedId === order.id}
                  onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  onUpdateStatus={updateStatus}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm gap-3">
          <p className="text-gray-500 text-center sm:text-left">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Order Card Component
interface MobileOrderCardProps {
  order: AdminOrder;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  isUpdating: boolean;
}

function MobileOrderCard({ order, isExpanded, onToggle, onUpdateStatus, isUpdating }: MobileOrderCardProps) {
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];
  const badgeCls = STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="bg-white min-w-0">
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/admin/orders/${order.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-xs font-semibold text-gray-500 hover:text-brand-primary-600 hover:underline"
            >
              #{order.id.split('-')[0].toUpperCase()}
            </Link>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeCls}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="font-medium text-gray-900 truncate">
            {order.profiles?.full_name ?? order.delivery_address.name}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <span>{order.delivery_address.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-2">
          <span className="font-semibold text-gray-900">
            {formatCurrency(order.total_amount)}
          </span>
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3 space-y-4 min-w-0">
            {/* Status Update */}
            {nextStatuses.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 uppercase block mb-2">Update Status</span>
                <div className="flex flex-wrap gap-2">
                  {isUpdating ? (
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  ) : (
                    nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus(order.id, s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition capitalize"
                      >
                        <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s]?.dot ?? 'bg-gray-300'}`} />
                        Mark {s}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* View Details Link */}
            <div>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-center gap-1 w-full py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                View Full Details <ArrowRight size={14} />
              </Link>
            </div>

            {/* Items */}
            <div>
              <span className="text-xs text-gray-500 uppercase flex items-center gap-1 mb-2">
                <Package size={12} /> Items
              </span>
              <ul className="space-y-2">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-700 break-words flex-1 min-w-0">
                      {item.product_name} <span className="text-gray-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.line_total)}</span>
                  </li>
                ))}
              </ul>
              {order.discount_amount > 0 && (
                <p className="text-xs text-status-success-700 mt-2 font-medium">
                  Discount: −{formatCurrency(order.discount_amount)}
                </p>
              )}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <span className="text-xs text-gray-500 uppercase flex items-center gap-1 mb-2">
                <MapPin size={12} /> Delivery Address
              </span>
              <address className="text-sm text-gray-700 not-italic leading-relaxed break-words">
                <p className="font-medium flex items-center gap-1">
                  <User size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="break-words">{order.delivery_address.name}</span>
                </p>
                <p className="flex items-center gap-1 text-gray-500 mt-1">
                  <Phone size={11} className="flex-shrink-0" />
                  {order.delivery_address.phone}
                </p>
                <p className="mt-2 break-words">{order.delivery_address.line1}</p>
                {order.delivery_address.line2 && <p className="break-words">{order.delivery_address.line2}</p>}
                <p className="text-gray-600 break-words">
                  {order.delivery_address.city}, {order.delivery_address.state}
                </p>
                <p className="text-gray-600">PIN: {order.delivery_address.pincode}</p>
              </address>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
