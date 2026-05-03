'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingBag,
  MapPin,
  Tag,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';

interface AddressForm {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_ADDRESS: AddressForm = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

interface PromoResult {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, clearCart, getTotalPrice, _hasHydrated } = useCart();

  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(`/auth/login?redirect=/checkout`);
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [router, supabase.auth]);

  const subtotal = getTotalPrice(); // prices in rupees (NUMERIC from DB)
  const discountAmount = promo?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  const validatePromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');

    try {
      const { data: promoData, error } = await supabase
        .from('promo_codes')
        .select('id, code, discount_type, discount_value, expires_at, usage_limit, times_used, is_active')
        .eq('code', code)
        .single();

      if (error || !promoData || !promoData.is_active) {
        setPromoError('Invalid or inactive promo code');
        return;
      }
      if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        setPromoError('This promo code has expired');
        return;
      }
      if (promoData.usage_limit !== null && promoData.times_used >= promoData.usage_limit) {
        setPromoError('This promo code has reached its usage limit');
        return;
      }

      let discountAmt = 0;
      if (promoData.discount_type === 'percentage') {
        discountAmt = Math.round((subtotal * Number(promoData.discount_value)) / 100 * 100) / 100;
      } else {
        discountAmt = Math.min(Number(promoData.discount_value), subtotal);
      }

      setPromo({
        code: promoData.code,
        discountType: promoData.discount_type as 'percentage' | 'flat',
        discountValue: Number(promoData.discount_value),
        discountAmount: discountAmt,
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (items.length === 0) {
      setFormError('Your cart is empty');
      return;
    }

    // Basic client-side validation (server validates authoritatively)
    const required: Array<keyof AddressForm> = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field].trim()) {
        setFormError(`Please fill in all required fields`);
        return;
      }
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setFormError('Phone number must be 10 digits');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setFormError('Pincode must be 6 digits');
      return;
    }

    setSubmitting(true);

    try {
      // Generate a client-side idempotency key (UUID v4 via crypto API)
      const idempotencyKey = crypto.randomUUID();

      const payload = {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        deliveryAddress: {
          name: address.name.trim(),
          phone: address.phone.trim(),
          line1: address.line1.trim(),
          line2: address.line2.trim() || undefined,
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
        promoCode: promo?.code,
        idempotencyKey,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? 'Failed to place order. Please try again.');
        return;
      }

      // Save delivery address to the user's address book (fire-and-forget).
      // Non-blocking: a failure here doesn't abort the order flow — the address
      // snapshot is already persisted inside the order record itself.
      fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_line1: address.line1.trim(),
          address_line2: address.line2.trim() || null,
          city: address.city.trim(),
          state: address.state.trim(),
          postal_code: address.pincode.trim(),
          country: 'India',
          phone: address.phone.trim(),
        }),
      }).catch((err) => console.warn('Address save failed (non-critical):', err));

      clearCart();
      router.push(`/orders/${json.data.id}?success=1`);
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Wait for both: (1) auth check and (2) Zustand persist rehydration from localStorage.
  // Without _hasHydrated, items is [] on first render even when the cart has products.
  if (isAuthenticated === null || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary-600" size={32} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag size={56} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h1>
          <p className="text-neutral-500 mb-6">Add some products before checking out.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-brand-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-primary-700 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Left: Delivery Address ── */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={20} className="text-brand-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  name="name"
                  value={address.name}
                  onChange={handleAddressChange}
                  placeholder="Ramesh Kumar"
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Address Line 1"
                    name="line1"
                    value={address.line1}
                    onChange={handleAddressChange}
                    placeholder="Flat 12, Sunrise Apartments, MG Road"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Address Line 2 (optional)"
                    name="line2"
                    value={address.line2}
                    onChange={handleAddressChange}
                    placeholder="Near Reliance Fresh"
                  />
                </div>
                <InputField
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Mumbai"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  placeholder="400001"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* ── Promo Code ── */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={20} className="text-brand-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Promo Code</h2>
              </div>

              {promo ? (
                <div className="flex items-center justify-between bg-status-success-50 border border-status-success-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-status-success-600" />
                    <span className="text-sm font-semibold text-status-success-800">
                      {promo.code} applied — {formatCurrency(promo.discountAmount)} off
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPromo(null); setPromoInput(''); }}
                    className="text-neutral-400 hover:text-neutral-700 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    placeholder="Enter promo code"
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                  />
                  <button
                    type="button"
                    onClick={validatePromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-50 transition"
                  >
                    {promoLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}

              {promoError && (
                <p className="mt-2 text-sm text-status-danger-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {promoError}
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag size={20} className="text-brand-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>
              </div>

              <ul className="space-y-3 mb-5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 truncate">{item.name}</p>
                      <p className="text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-neutral-900 flex-shrink-0">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-status-success-700 font-medium">
                    <span>Discount</span>
                    <span>−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="text-status-success-700 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {formError && (
                <div className="mt-4 flex items-start gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg p-3">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 bg-brand-primary-600 hover:bg-brand-primary-700 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-400 text-center mt-3">
                Payment will be collected after delivery (COD) or via Razorpay.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reusable input component ──────────────────────────────────────────────────

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, required, ...rest }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...rest}
        required={required}
        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
      />
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
