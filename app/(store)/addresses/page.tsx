'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Home,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

type Address = {
  id: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  phone?: string | null;
  is_default?: boolean;
};

const EMPTY_FORM = {
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  phone: '',
  is_default: false,
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const fetchAddresses = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const json = await res.json();
        setAddresses(json.addresses ?? []);
      } else {
        console.error('Failed to fetch addresses:', res.status);
      }
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/addresses');
      return;
    }
    fetchAddresses();
  }, [authLoading, user, router, fetchAddresses]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (a: Address) => {
    setEditingId(a.id);
    setForm({
      address_line1: a.address_line1,
      address_line2: a.address_line2 ?? '',
      city: a.city,
      state: a.state ?? '',
      postal_code: a.postal_code,
      country: a.country,
      phone: a.phone ?? '',
      is_default: !!a.is_default,
    });
    setFormError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.address_line1.trim() || !form.city.trim() || !form.postal_code.trim()) {
      setFormError('Address line 1, city, and postal code are required.');
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setFormError('Phone must be a 10-digit number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim(),
        country: form.country || 'India',
        phone: form.phone.trim() || null,
        is_default: form.is_default,
      };

      const res = editingId
        ? await fetch(`/api/addresses/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        toast.success(editingId ? 'Address updated' : 'Address added');
        closeForm();
        fetchAddresses();
      } else {
        const json = await res.json();
        setFormError(json.error ?? 'Failed to save address. Please try again.');
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this address from your saved addresses?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address removed');
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error('Failed to remove address');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header hideSearch />

      <main className="max-w-3xl mx-auto px-4 py-8 mt-20">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <MapPin size={22} className="text-brand-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Saved Addresses</h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {addresses.length === 0
                  ? 'No addresses saved yet'
                  : `${addresses.length} address${addresses.length === 1 ? '' : 'es'} saved`}
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary-600 text-white rounded-xl text-sm font-medium hover:bg-brand-primary-700 transition shadow-sm"
            >
              <Plus size={16} />
              Add Address
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleChange}
                  placeholder="Flat 12, Sunrise Apartments, MG Road"
                  required
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Address Line 2 <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Near Reliance Fresh"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  required
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="400001"
                  maxLength={6}
                  inputMode="numeric"
                  required
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Phone <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                  className="rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                />
                <label htmlFor="is_default" className="text-sm text-neutral-700 flex items-center gap-1.5">
                  <Star size={13} className="text-brand-primary-500" />
                  Set as default address
                </label>
              </div>

              {formError && (
                <div className="sm:col-span-2 flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="sm:col-span-2 flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-xl text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-60 transition"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {fetching ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home size={28} className="text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">No addresses saved</h2>
            <p className="text-sm text-neutral-500 mb-5">
              Add an address to speed up your checkout next time.
            </p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-xl text-sm font-medium hover:bg-brand-primary-700 transition"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition ${
                  a.is_default
                    ? 'border-brand-primary-300 ring-1 ring-brand-primary-200'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${a.is_default ? 'bg-brand-primary-50' : 'bg-neutral-100'}`}>
                      <MapPin
                        size={16}
                        className={a.is_default ? 'text-brand-primary-600' : 'text-neutral-500'}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-neutral-900 text-sm">
                          {a.address_line1}
                          {a.address_line2 ? `, ${a.address_line2}` : ''}
                        </p>
                        {a.is_default && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary-700 bg-brand-primary-50 border border-brand-primary-200 px-2 py-0.5 rounded-full">
                            <Star size={9} fill="currentColor" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {a.city}{a.state ? `, ${a.state}` : ''} — {a.postal_code}
                      </p>
                      <p className="text-sm text-neutral-400">{a.country}</p>
                      {a.phone && (
                        <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                          <Phone size={12} className="text-neutral-400" /> {a.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(a)}
                      className="p-2 text-neutral-400 hover:text-brand-primary-600 hover:bg-brand-primary-50 rounded-lg transition"
                      title="Edit address"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      className="p-2 text-neutral-400 hover:text-status-danger-600 hover:bg-status-danger-50 rounded-lg transition disabled:opacity-50"
                      title="Remove address"
                    >
                      {deletingId === a.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
