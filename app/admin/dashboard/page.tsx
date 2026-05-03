'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Banknote,
  UsersRound,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
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

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards: StatCard[] = stats
    ? [
        {
          title: 'Total Orders',
          value: stats.totalOrders.toLocaleString('en-IN'),
          sub: `${stats.pendingOrders} pending`,
          icon: ShoppingCart,
          iconBg: 'bg-brand-primary-100',
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
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={24} className="text-brand-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">Overview of your store performance</p>

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
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  {href && <ArrowRight size={14} className="text-gray-300" />}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
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