'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
  Tag,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
} from 'lucide-react';
import { PromoCardSkeleton } from '@/components/admin/SkeletonLoading';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  one_per_user: boolean;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'flat',
  discount_value: '',
  expires_at: '',
  usage_limit: '',
  one_per_user: false,
  is_active: true,
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setPromos(json.data ?? []);
    } catch {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const resetFormState = () => {
    setShowForm(false);
    setEditingPromoId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const startEditingPromo = (promo: PromoCode) => {
    setForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      expires_at: promo.expires_at ? new Date(promo.expires_at).toISOString().slice(0, 16) : '',
      usage_limit: promo.usage_limit === null ? '' : String(promo.usage_limit),
      one_per_user: promo.one_per_user,
      is_active: promo.is_active,
    });
    setEditingPromoId(promo.id);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.code.trim() || !form.discount_value) {
      setFormError('Code and discount value are required');
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      expires_at: form.expires_at || null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      one_per_user: form.one_per_user,
      is_active: form.is_active,
    };

    setSubmitting(true);
    try {
      const isEditing = editingPromoId !== null;
      const endpoint = isEditing ? `/api/admin/promos/${editingPromoId}` : '/api/admin/promos';
      const res = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? `Failed to ${isEditing ? 'update' : 'create'} promo`);
        return;
      }
      toast.success(`Promo code ${isEditing ? 'updated' : 'created'}`);
      resetFormState();
      fetchPromos();
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    setTogglingId(promo.id);
    try {
      const res = await fetch(`/api/admin/promos/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !promo.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Promo ${promo.is_active ? 'deactivated' : 'activated'}`);
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, is_active: !p.is_active } : p)));
      await fetchPromos();
    } catch {
      toast.error('Failed to update promo');
    } finally {
      setTogglingId(null);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Deactivate this promo code? It will no longer be usable.')) return;
    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Promo deactivated');
      fetchPromos();
    } catch {
      toast.error('Failed to deactivate promo');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminBreadcrumbs items={[{ label: 'Promo Codes' }]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag size={24} className="text-brand-primary-600" />
            Promo Codes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{promos.filter((p) => p.is_active).length} active</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPromos}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              if (showForm) {
                resetFormState();
                return;
              }
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition font-medium"
          >
            <Plus size={16} />
            {showForm ? 'Close' : 'New Promo'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editingPromoId ? 'Edit Promo Code' : 'Create Promo Code'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'flat' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {form.discount_type === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  min={0.01}
                  max={form.discount_type === 'percentage' ? 100 : undefined}
                  step={0.01}
                  value={form.discount_value}
                  onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                  placeholder={form.discount_type === 'percentage' ? '20' : '100'}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expires At</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
              <input
                type="number"
                min={1}
                value={form.usage_limit}
                onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="one_per_user"
                checked={form.one_per_user}
                onChange={(e) => setForm((f) => ({ ...f, one_per_user: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="one_per_user" className="text-sm text-gray-700">One use per customer</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active immediately</label>
            </div>

            {formError && (
              <div className="sm:col-span-2 flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-60 transition"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {editingPromoId ? 'Update Promo' : 'Create Promo'}
              </button>
              <button
                type="button"
                onClick={resetFormState}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <PromoCardSkeleton promos={6} />
        ) : promos.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p>No promo codes yet</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Usage</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {promos.map((promo) => {
                    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                    const isExhausted = promo.usage_limit !== null && promo.times_used >= promo.usage_limit;

                    return (
                      <tr key={promo.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {promo.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {promo.discount_type === 'percentage'
                            ? `${promo.discount_value}%`
                            : formatCurrency(promo.discount_value)}{' '}
                          <span className="text-xs text-gray-400">
                            ({promo.discount_type === 'percentage' ? 'off' : 'flat'})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {promo.times_used}
                          {promo.usage_limit !== null && ` / ${promo.usage_limit}`}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {promo.expires_at
                            ? new Date(promo.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : <span className="text-gray-400">Never</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <XCircle size={11} /> Expired
                            </span>
                          ) : isExhausted ? (
                            <span className="inline-flex items-center gap-1 text-xs text-status-warning-700 bg-status-warning-100 px-2 py-0.5 rounded-full">
                              <AlertCircle size={11} /> Exhausted
                            </span>
                          ) : promo.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs text-status-success-700 bg-status-success-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/promos/${promo.id}`}
                              className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => toggleActive(promo)}
                              disabled={togglingId === promo.id}
                              className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                            >
                              {togglingId === promo.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : promo.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => startEditingPromo(promo)}
                              className="p-1.5 text-gray-400 hover:text-brand-primary-600 hover:bg-brand-primary-50 rounded-lg transition"
                              title="Edit promo"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deletePromo(promo.id)}
                              className="p-1.5 text-gray-400 hover:text-status-danger-600 hover:bg-status-danger-50 rounded-lg transition"
                              title="Soft delete (deactivate)"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {promos.map((promo) => {
                const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                const isExhausted = promo.usage_limit !== null && promo.times_used >= promo.usage_limit;
                
                return (
                  <MobilePromoCard
                    key={promo.id}
                    promo={promo}
                    isExpired={!!isExpired}
                    isExhausted={!!isExhausted}
                    isToggling={togglingId === promo.id}
                    onToggle={() => toggleActive(promo)}
                    onEdit={() => startEditingPromo(promo)}
                    onDelete={() => deletePromo(promo.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Mobile Promo Card Component
interface MobilePromoCardProps {
  promo: PromoCode;
  isExpired: boolean;
  isExhausted: boolean;
  isToggling: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function MobilePromoCard({ promo, isExpired, isExhausted, isToggling, onToggle, onEdit, onDelete }: MobilePromoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-primary-100 flex items-center justify-center flex-shrink-0">
            <Tag size={20} className="text-brand-primary-600" />
          </div>
          <div>
            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">
              {promo.code}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-brand-primary-600 font-semibold">
                {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatCurrency(promo.discount_value)}
              </span>
              <span className="text-xs text-gray-400">off</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpired ? (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Expired</span>
          ) : isExhausted ? (
            <span className="text-xs text-status-warning-700 bg-status-warning-100 px-2 py-0.5 rounded-full">Exhausted</span>
          ) : promo.is_active ? (
            <span className="text-xs text-status-success-700 bg-status-success-100 px-2 py-0.5 rounded-full">Active</span>
          ) : (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
          )}
          {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            {/* Usage */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase flex items-center gap-1">
                <Users size={12} /> Usage
              </span>
              <span className="text-sm text-gray-700">
                {promo.times_used} used
                {promo.usage_limit !== null && ` / ${promo.usage_limit} limit`}
              </span>
            </div>

            {/* Expires */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase flex items-center gap-1">
                <Calendar size={12} /> Expires
              </span>
              <span className="text-sm text-gray-700">
                {promo.expires_at
                  ? new Date(promo.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : 'Never'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggle}
                  disabled={isToggling}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  {isToggling ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : promo.is_active ? (
                    'Deactivate'
                  ) : (
                    'Activate'
                  )}
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-primary-50 text-brand-primary-600 rounded-lg text-sm font-medium"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 bg-status-danger-50 text-status-danger-700 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
