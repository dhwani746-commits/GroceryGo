'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/shared/Header';

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

export default function AddressesPage() {
  const { user, profile, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState<Partial<Address>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/addresses', { credentials: 'same-origin' });
      if (res.ok) {
        const json = await res.json();
        setAddresses(json.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchAddresses();
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      state: form.state,
      postal_code: form.postal_code,
      country: form.country,
      phone: form.phone,
      is_default: !!form.is_default,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/addresses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setEditingId(null);
          setForm({});
          fetchAddresses();
        }
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setForm({});
          fetchAddresses();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (a: Address) => {
    setEditingId(a.id);
    setForm(a);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      if (res.ok) fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Addresses</h2>
        <p className="mt-2">Please sign in to manage your addresses.</p>
      </div>
    );
  }

  return (
    <>
    <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-4">Your Addresses</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Address line 1</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.address_line1 || ''} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address line 2</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.address_line2 || ''} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.postal_code || ''} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input className="w-full border rounded-md px-3 py-2" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
                <span className="text-sm">Set as default</span>
              </label>

              <div className="ml-auto">
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm({}); }} className="mr-2 px-3 py-2 rounded-md border">Cancel</button>
                )}
                <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent-500 text-white">{editingId ? 'Update Address' : 'Add Address'}</button>
              </div>
            </div>
          </form>

          <section>
            <h2 className="text-xl font-medium mb-3">Saved Addresses</h2>

            {loadingList ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-3">
                {addresses.length === 0 && <div className="text-neutral-600">No addresses saved.</div>}
                {addresses.map((a) => (
                  <div key={a.id} className="border rounded-md p-4 flex justify-between items-start">
                    <div>
                      <div className="font-medium">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}</div>
                      <div className="text-sm text-neutral-600">{a.city}{a.state ? `, ${a.state}` : ''} {a.postal_code}</div>
                      <div className="text-sm text-neutral-600">{a.country}</div>
                      {a.phone && <div className="text-sm text-neutral-600">{a.phone}</div>}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)} className="px-3 py-2 rounded-md border">Edit</button>
                      <button onClick={() => handleDelete(a.id)} className="px-3 py-2 rounded-md bg-status-danger-500 text-white">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
    </>
  );
} 
