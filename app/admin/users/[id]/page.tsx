'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingBag,
  MapPin,
  Package,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  CreditCard,
  Truck,
  XCircle,
  Home,
} from 'lucide-react';

interface UserAddress {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface UserOrder {
  id: string;
  status: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    products?: {
      image_urls: string[] | null;
    } | null;
  }[];
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;
  addresses: UserAddress[];
  orders: UserOrder[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-yellow-800', bg: 'bg-yellow-100', icon: Clock },
  paid: { label: 'Paid', color: 'text-green-800', bg: 'bg-green-100', icon: CreditCard },
  confirmed: { label: 'Confirmed', color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-blue-800', bg: 'bg-blue-100', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-800', bg: 'bg-purple-100', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-800', bg: 'bg-red-100', icon: XCircle },
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
      } else {
        toast.error('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <Link href="/admin/users" className="text-brand-primary-600 hover:underline font-medium">
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const totalSpent = user.orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrders = user.orders.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} /> Back to Users
          </Link>
        </div>
        <button
          onClick={fetchUser}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary-100 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-brand-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.full_name || 'Unnamed User'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Member since {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary-100 text-brand-primary-700 rounded-full text-sm font-medium w-fit">
                  <Shield size={14} />
                  Admin
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                {new Date(user.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-xs text-gray-500 uppercase">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-500 uppercase">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user.addresses.length}</p>
            <p className="text-xs text-gray-500 uppercase">Saved Addresses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {user.orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-xs text-gray-500 uppercase">Delivered</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gray-500" />
                <h2 className="font-semibold text-gray-900">Order History</h2>
              </div>
              <span className="text-sm text-gray-500">{totalOrders} orders</span>
            </div>

            {user.orders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {user.orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div key={order.id} className="hover:bg-gray-50 transition">
                      <div
                        className="p-4 sm:p-5 cursor-pointer"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-mono text-sm font-semibold text-brand-primary-600 hover:underline"
                              >
                                #{order.id.split('-')[0].toUpperCase()}
                              </Link>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.color}`}>
                                <StatusIcon size={10} />
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                            <p className="text-xs text-gray-500">{order.order_items.length} item(s)</p>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                              Items in this order
                            </h4>
                            <ul className="space-y-3">
                              {order.order_items.map((item) => (
                                <li key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                                  {item.products?.image_urls?.[0] ? (
                                    <img
                                      src={item.products.image_urls[0]}
                                      alt={item.product_name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <Package size={20} className="text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatCurrency(item.unit_price)} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {formatCurrency(item.line_total)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm">
                              <span className="text-gray-500">Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>−{formatCurrency(order.discount_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2">
                              <span>Total</span>
                              <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Addresses Section */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Home size={20} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
            </div>

            {user.addresses.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MapPin size={36} className="mx-auto mb-3 opacity-30" />
                <p>No addresses saved</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {user.addresses.map((addr) => (
                  <div key={addr.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{addr.name}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-brand-primary-100 text-brand-primary-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <address className="mt-2 text-sm text-gray-600 not-italic leading-relaxed">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                    </address>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
