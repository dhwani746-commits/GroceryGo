'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, RefreshCw, Loader2, Search, User, Mail, Phone, Calendar, Shield, Filter, ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';
import { UserCardSkeleton, FilterSkeleton } from '@/components/admin/SkeletonLoading';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  recent_orders: RecentOrder[];
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'customer', label: 'Customers' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search and role
  const filtered = users.filter((u) => {
    // Role filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'admin' && u.role !== 'admin') return false;
      if (roleFilter === 'customer' && u.role === 'admin') return false;
    }
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      return (
        (u.full_name?.toLowerCase() ?? '').includes(searchLower) ||
        (u.email?.toLowerCase() ?? '').includes(searchLower) ||
        (u.phone?.toLowerCase() ?? '').includes(searchLower)
      );
    }
    
    return true;
  });

  // Sort by created_at descending (newest first)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      <AdminBreadcrumbs items={[{ label: 'Users' }]} />
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-brand-primary-600" />
            Users
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {users.length} users
            {roleFilter !== 'all' && ` (${ROLE_OPTIONS.find(o => o.value === roleFilter)?.label})`}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center p-2 sm:px-3 sm:py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-400 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 bg-white" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
          />
        </div>
        <div className="relative sm:w-40">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'customer')}
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500 appearance-none bg-white"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <UserCardSkeleton users={8} />
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p>{search ? 'No users found matching your search' : 'No users yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((user) => {
              const isExpanded = expandedId === user.id;
              const hasOrders = user.recent_orders && user.recent_orders.length > 0;
              
              return (
                <div
                  key={user.id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* Clickable Header */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar - Link to detail */}
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="w-10 h-10 rounded-full bg-brand-primary-100 flex items-center justify-center flex-shrink-0 hover:bg-brand-primary-200 transition"
                      >
                        <User size={20} className="text-brand-primary-600" />
                      </Link>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-semibold text-gray-900 truncate hover:text-brand-primary-600 transition"
                          >
                            {user.full_name || 'Unnamed User'}
                          </Link>
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-primary-100 text-brand-primary-700 rounded-full text-xs font-medium">
                                <Shield size={10} />
                                Admin
                              </span>
                            )}
                            {hasOrders && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : user.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                              >
                                <ShoppingBag size={10} />
                                {user.recent_orders.length} order{user.recent_orders.length > 1 ? 's' : ''}
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : user.id)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          {user.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </p>
                          )}
                          {user.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone size={14} className="text-gray-400 flex-shrink-0" />
                              {user.phone}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Calendar size={12} className="flex-shrink-0" />
                            Joined {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Recent Orders */}
                  {isExpanded && hasOrders && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                      <div className="bg-gray-50 rounded-xl p-4 mt-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <ShoppingBag size={12} />
                          Recent Orders
                        </h4>
                        <div className="space-y-3">
                          {user.recent_orders.map((order) => (
                            <Link
                              key={order.id}
                              href={`/admin/orders/${order.id}`}
                              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary-300 hover:shadow-md transition-all duration-200 block"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-brand-primary-600 hover:underline">
                                    #{order.id.split('-')[0].toUpperCase()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                      day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(order.total_amount)}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          View Full Profile <ArrowRight size={14} />
                        </Link>
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
  );
}
