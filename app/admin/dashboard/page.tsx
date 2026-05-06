'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Banknote,
  UsersRound,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw,
  Package,
  AlertCircle,
  Star,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface PendingOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  topProducts: TopProduct[];
  recentPendingOrders: PendingOrder[];
}

interface StatCard {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.success) {
        setStats({
          ...json.data,
          topProducts: json.data.topProducts || [],
          recentPendingOrders: json.data.recentPendingOrders || [],
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchStats]);

  const cards: StatCard[] = stats
    ? [
        {
          title: 'Total Orders',
          value: stats.totalOrders.toLocaleString('en-IN'),
          sub: `${stats.pendingOrders} pending`,
          icon: ShoppingCart,
          iconBg: 'bg-brand-primary-200',
          iconColor: 'text-brand-primary-600',
          href: '/admin/orders',
        },
        {
          title: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          sub: 'From confirmed orders',
          icon: Banknote,
          iconBg: 'bg-status-success-100',
          iconColor: 'text-status-success-700',
        },
        {
          title: 'Customers',
          value: stats.totalCustomers.toLocaleString('en-IN'),
          sub: 'Registered users',
          icon: UsersRound,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
        },
        {
          title: 'Pending Orders',
          value: stats.pendingOrders.toLocaleString('en-IN'),
          sub: 'Awaiting confirmation',
          icon: Clock,
          iconBg: 'bg-status-warning-100',
          iconColor: 'text-status-warning-700',
          href: '/admin/orders?status=pending',
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-brand-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center p-2 sm:px-3 sm:py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          title="Refresh stats"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Overview of your store performance</p>
      {lastUpdated && (
        <p className="text-xs text-gray-400 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(({ title, value, sub, icon: Icon, iconBg, iconColor, href }) => {
            const inner = (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Mobile: Horizontal layout | Desktop: Vertical layout */}
                <div className="flex sm:block items-center gap-3 sm:gap-0">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 sm:mb-4`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  
                  {/* Content - Right side on mobile, below icon on desktop */}
                  <div className="flex-1 min-w-0 sm:mb-1">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                  
                </div>
                
                {/* Title and subtitle */}
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                
                {/* Mobile: Title and sub inline */}
                <div className="sm:hidden mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">{title}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            );

            return href ? (
              <Link key={title} href={href} className="block group">
                {inner}
              </Link>
            ) : (
              <div key={title}>{inner}</div>
            );
          })}
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 5 Products */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Top 5 Products</h2>
            </div>
            <span className="text-xs text-gray-400">Most ordered</span>
          </div>
          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.topProducts.map((product, idx) => (
                <div key={product.product_name} className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {product.total_quantity} sold • {formatCurrency(product.total_revenue)} revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Package size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </div>

        {/* Recent Pending Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Pending Orders</h2>
            </div>
            <Link href="/admin/orders?status=pending" className="text-xs text-brand-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats?.recentPendingOrders && stats.recentPendingOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recentPendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="p-4 block hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        #{order.id.split('-')[0].toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pending orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Manage Orders',   href: '/admin/orders',   description: 'View & update order statuses',     icon: ShoppingCart },
          { label: 'Manage Products', href: '/admin/products', description: 'Add, edit, or remove products',    icon: TrendingUp },
          { label: 'Promo Codes',     href: '/admin/promos',   description: 'Create and manage discount codes', icon: Banknote },
        ].map(({ label, href, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-brand-primary-200 transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon size={18} className="text-brand-primary-600" />
              <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
            </div>
            <p className="text-xs text-gray-400">{description}</p>
            <div className="flex items-center gap-1 text-xs text-brand-primary-600 font-medium mt-3 group-hover:gap-2 transition-all">
              Open <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {stats && (
        <p className="text-xs text-gray-400 mt-6 text-right">
          Stats are live from the database
        </p>
      )}
    </div>
  );
}