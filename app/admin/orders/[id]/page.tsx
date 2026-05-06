'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  ShoppingBag,
  Loader2,
  ChevronDown,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products?: {
    image_urls: string[] | null;
  } | null;
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
  updated_at: string;
  order_items: OrderItem[];
  profiles?: { full_name: string; phone: string | null; email: string | null } | null;
  promo_code?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-200', icon: Clock },
  paid: { label: 'Paid', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-200', icon: CreditCard },
  confirmed: { label: 'Confirmed', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-200', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-200', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-200', icon: XCircle },
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ['paid', 'confirmed', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        toast.error('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Order status updated to "${newStatus}"`);
      setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      setShowStatusDropdown(false);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 mb-6">This order doesn't exist.</p>
          <Link href="/admin/orders" className="text-brand-primary-600 hover:underline font-medium">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
  const StatusIcon = statusCfg.icon;
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];
  const activeStep = TIMELINE_STEPS.indexOf(order.status as typeof TIMELINE_STEPS[number]);
  const shortId = order.id.split('-')[0].toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} /> Back to Orders
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrder}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <span className="text-sm text-gray-500 font-mono">
            #{shortId}
          </span>
        </div>
      </div>

      {/* Order Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Order Details
        </h1>
        <p className="text-sm text-gray-500">
          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Order Items & Status ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card with Update */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <StatusIcon size={18} className={statusCfg.color} />
                <span className="text-sm font-medium text-gray-600">Current Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
                {nextStatuses.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      disabled={updating}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>Update <ChevronDown size={14} /></>
                      )}
                    </button>
                    {showStatusDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowStatusDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                          {nextStatuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(s)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 capitalize first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s]?.bg.replace('bg-', 'bg-') ?? 'bg-gray-200'}`} />
                              Mark as {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {order.status !== 'cancelled' && activeStep >= 0 && (
              <div className="flex items-center gap-0 mt-4 pt-4 border-t border-gray-100">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= activeStep;
                  const isLast = idx === TIMELINE_STEPS.length - 1;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isCompleted ? 'bg-brand-primary-600' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] mt-1 hidden sm:block ${isCompleted ? 'text-brand-primary-700 font-medium' : 'text-gray-400'}`}>
                          {STATUS_CONFIG[step]?.label ?? step}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-0.5 mx-1 ${idx < activeStep ? 'bg-brand-primary-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">This order has been cancelled</span>
              </div>
            )}
          </div>

          {/* Items Ordered */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Items Ordered</h2>
              <span className="text-sm text-gray-500 ml-auto">{order.order_items.length} item(s)</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {order.order_items.map((item) => {
                const imgUrl = item.products?.image_urls?.[0];
                return (
                  <li key={item.id} className="py-4 flex gap-4 items-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency(item.line_total)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Right Column: Customer & Payment ── */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {order.profiles?.full_name || order.delivery_address.name}
              </p>
              {order.profiles?.email && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  {order.profiles.email}
                </p>
              )}
              {order.profiles?.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  {order.profiles.phone}
                </p>
              )}
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Calendar size={12} className="text-gray-400" />
                Customer ID: {order.customer_id.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Payment Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
                  <span>−{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-700">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <address className="text-sm text-gray-600 not-italic leading-relaxed">
              <p className="font-medium text-gray-900">{order.delivery_address.name}</p>
              <p>{order.delivery_address.phone}</p>
              <p className="mt-1">{order.delivery_address.line1}</p>
              {order.delivery_address.line2 && <p>{order.delivery_address.line2}</p>}
              <p>{order.delivery_address.city}, {order.delivery_address.state} — {order.delivery_address.pincode}</p>
            </address>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Information</h4>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Order ID: <span className="font-mono">{order.id}</span></p>
              <p>Last Updated: {new Date(order.updated_at).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
