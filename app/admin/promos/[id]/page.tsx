'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Users,
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Clock,
  IndianRupee,
  Pencil,
} from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { PromoDetailSkeleton } from '@/components/admin/SkeletonLoading';
import { toast } from 'sonner';
import { EditPromoModal, type PromoCode } from '@/components/admin/EditPromoModal';


interface UsageHistory {
  id: string;
  discount_amount: number;
  used_at: string;
  user_id: string;
  order_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  orders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  };
}

interface PromoDetailData {
  promo: PromoCode;
  usageHistory: UsageHistory[];
}

export default function PromoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PromoDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchPromoDetails();
  }, [params.id]);

  const fetchPromoDetails = async () => {
    try {
      const res = await fetch(`/api/admin/promos/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Promo code not found');
        } else {
          setError('Failed to load promo code details');
        }
        return;
      }
      const json = await res.json();
      setData(json.data);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-status-warning-100 text-status-warning-700', icon: AlertCircle, label: 'Pending' },
      paid: { color: 'bg-brand-primary-100 text-brand-primary-700', icon: Clock, label: 'Paid' },
      confirmed: { color: 'bg-status-success-100 text-status-success-700', icon: CheckCircle2, label: 'Confirmed' },
      processing: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-700', icon: ShoppingBag, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
      cancelled: { color: 'bg-status-danger-100 text-status-danger-700', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <PromoDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AdminBreadcrumbs items={[
          { label: 'Promo Codes', href: '/admin/promos' },
          { label: 'Details' }
        ]} />
        <div className="text-center py-20">
          <Tag size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Promo code not found'}</h2>
          <p className="text-gray-500 mb-6">The promo code you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/admin/promos"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition"
          >
            <ArrowLeft size={16} />
            Back to Promo Codes
          </Link>
        </div>
      </div>
    );
  }

  const { promo, usageHistory } = data;
  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
  const isExhausted = promo.usage_limit !== null && promo.times_used >= promo.usage_limit;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminBreadcrumbs items={[
        { label: 'Promo Codes', href: '/admin/promos' },
        { label: promo.code }
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{promo.code}</h1>
            {isExpired ? (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <XCircle size={12} /> Expired
              </span>
            ) : isExhausted ? (
              <span className="inline-flex items-center gap-1 text-xs text-status-warning-700 bg-status-warning-100 px-2 py-1 rounded-full">
                <AlertCircle size={12} /> Exhausted
              </span>
            ) : promo.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs text-status-success-700 bg-status-success-100 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <XCircle size={12} /> Inactive
              </span>
            )}
          </div>
          <p className="text-gray-500">
            Created on {new Date(promo.created_at).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white text-sm font-medium rounded-lg hover:bg-brand-primary-700 transition"
          >
            <Pencil size={15} />
            Edit Promo
          </button>
          <Link
            href="/admin/promos"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <ArrowLeft size={15} />
            Back to List
          </Link>
        </div>
      </div>

      {/* Promo Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-primary-100 rounded-lg flex items-center justify-center">
              <Tag size={20} className="text-brand-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Discount</h3>
          </div>
          <p className="text-2xl font-bold text-brand-primary-600">
            {promo.discount_type === 'percentage' 
              ? `${promo.discount_value}%` 
              : formatCurrency(promo.discount_value)
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {promo.discount_type === 'percentage' ? 'Percentage off' : 'Flat discount'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Usage</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {promo.times_used}
            {promo.usage_limit && ` / ${promo.usage_limit}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {promo.usage_limit ? 'Limited usage' : 'Unlimited usage'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown size={20} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Saved</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(usageHistory.reduce((sum, usage) => sum + Number(usage.discount_amount), 0))}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            By {usageHistory.length} customers
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">One Per User</span>
              <span className={`text-sm font-medium ${promo.one_per_user ? 'text-green-600' : 'text-gray-600'}`}>
                {promo.one_per_user ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <span className={`text-sm font-medium ${promo.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                {promo.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {promo.expires_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Expires</span>
                <span className="text-sm font-medium">
                  {new Date(promo.expires_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Average Discount</span>
              <span className="text-sm font-medium">
                {usageHistory.length > 0 
                  ? formatCurrency(usageHistory.reduce((sum, usage) => sum + Number(usage.discount_amount), 0) / usageHistory.length)
                  : formatCurrency(0)
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Usage Rate</span>
              <span className="text-sm font-medium">
                {promo.usage_limit 
                  ? `${Math.round((promo.times_used / promo.usage_limit) * 100)}%`
                  : 'Unlimited'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last Used</span>
              <span className="text-sm font-medium">
                {usageHistory.length > 0 
                  ? new Date(usageHistory[0].used_at).toLocaleDateString('en-IN')
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Usage History ({usageHistory.length})
          </h2>
        </div>
        
        {usageHistory.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ShoppingBag size={36} className="mx-auto mb-3" />
            <p>No usage history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Discount</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usageHistory.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{usage.profiles.full_name}</p>
                          <p className="text-xs text-gray-500">{usage.profiles.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${usage.order_id}`}
                        className="font-mono text-sm text-brand-primary-600 hover:text-brand-primary-800"
                      >
                        #{usage.orders.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-gray-500">{formatCurrency(usage.orders.total_amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <IndianRupee size={14} />
                        {formatCurrency(usage.discount_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(usage.orders.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(usage.used_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {isEditOpen && (
        <EditPromoModal
          promo={promo}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updated) => {
            setData((prev) => prev ? { ...prev, promo: updated } : prev);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
