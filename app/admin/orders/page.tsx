'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Search,
  ChevronDown,
  Loader2,
  RefreshCw,
  Package,
  MapPin,
  Phone,
} from 'lucide-react';
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

  // Client-side name search filter
  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.id.startsWith(search.toLowerCase()) ||
          o.delivery_address.name.toLowerCase().includes(search.toLowerCase()) ||
          (o.profiles?.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={24} className="text-brand-primary-600" />
            Orders
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 bg-white rounded-lg border border-gray-200">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
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
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-gray-700">
                            #{order.id.split('-')[0].toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {order.profiles?.full_name ?? order.delivery_address.name}
                          </p>
                          <p className="text-xs text-gray-400">{order.delivery_address.city}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
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
                            {nextStatuses.length > 0 ? (
                              <div className="relative group">
                                <button
                                  disabled={updatingId === order.id}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition disabled:opacity-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {updatingId === order.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <>Update <ChevronDown size={12} /></>
                                  )}
                                </button>
                                {/* Dropdown */}
                                <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32">
                                  {nextStatuses.map((s) => (
                                    <button
                                      key={s}
                                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 capitalize first:rounded-t-lg last:rounded-b-lg"
                                    >
                                      Mark as {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">—</span>
                            )}
                            <ChevronDown
                              size={14}
                              className={`text-gray-400 transition-transform ml-1 ${isExpanded ? 'rotate-180' : ''}`}
                            />
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
