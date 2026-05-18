'use client';

import { useState } from 'react';
import { Pencil, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Exported so both pages can type their promo objects consistently
export interface PromoCode {
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
  updated_at?: string;
}

interface EditPromoModalProps {
  promo: PromoCode;
  onClose: () => void;
  /** Called with the updated promo returned from the server */
  onSaved: (updated: PromoCode) => void;
}

export function EditPromoModal({ promo, onClose, onSaved }: EditPromoModalProps) {
  const [form, setForm] = useState({
    code:           promo.code,
    discount_type:  promo.discount_type as 'percentage' | 'flat',
    discount_value: String(promo.discount_value),
    // Convert ISO timestamp → "YYYY-MM-DDTHH:MM" for datetime-local input
    expires_at:     promo.expires_at
      ? new Date(promo.expires_at).toISOString().slice(0, 16)
      : '',
    usage_limit:    promo.usage_limit !== null ? String(promo.usage_limit) : '',
    one_per_user:   promo.one_per_user,
    is_active:      promo.is_active,
  });
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState('');

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setFormErr('');

    if (!form.code.trim()) {
      setFormErr('Code is required'); return;
    }
    if (!form.discount_value || isNaN(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
      setFormErr('Discount value must be a positive number'); return;
    }
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) {
      setFormErr('Percentage discount cannot exceed 100'); return;
    }
    if (form.usage_limit && (isNaN(Number(form.usage_limit)) || Number(form.usage_limit) < 1)) {
      setFormErr('Usage limit must be a positive integer'); return;
    }

    setSaving(true);
    try {
      const body = {
        code:           form.code.toUpperCase().trim(),
        discount_type:  form.discount_type,
        discount_value: Number(form.discount_value),
        expires_at:     form.expires_at || null,
        usage_limit:    form.usage_limit ? Number(form.usage_limit) : null,
        one_per_user:   form.one_per_user,
        is_active:      form.is_active,
      };

      const res  = await fetch(`/api/admin/promos/${promo.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setFormErr(json.error ?? 'Failed to update promo');
        return;
      }

      toast.success(`Promo "${json.data.code}" updated successfully`);
      onSaved(json.data as PromoCode);
    } catch {
      setFormErr('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pencil size={18} className="text-brand-primary-600" />
            Edit Promo Code
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5">

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              placeholder="e.g. SAVE20"
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => set('discount_type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
              </label>
              <input
                type="number"
                min={1}
                max={form.discount_type === 'percentage' ? 100 : undefined}
                step={form.discount_type === 'flat' ? 1 : 0.01}
                value={form.discount_value}
                onChange={(e) => set('discount_value', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date &amp; Time{' '}
              <span className="text-gray-400 font-normal">(leave blank for no expiry)</span>
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => set('expires_at', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            />
          </div>

          {/* Usage limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit{' '}
              <span className="text-gray-400 font-normal">(leave blank for unlimited)</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.usage_limit}
              onChange={(e) => set('usage_limit', e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            />
          </div>

          {/* Toggle switches */}
          <div className="space-y-3">
            {(
              [
                { key: 'one_per_user', label: 'One use per customer' },
                { key: 'is_active',    label: 'Active'               },
              ] as const
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <button
                  type="button"
                  onClick={() => set(key, !form[key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form[key] ? 'bg-brand-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>

          {/* Inline error */}
          {formErr && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={15} className="flex-shrink-0" />
              {formErr}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
