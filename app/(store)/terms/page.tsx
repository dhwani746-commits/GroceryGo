import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, ShoppingBag, Truck, RefreshCw, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — GroceryGo',
  description: 'GroceryGo Terms of Service: Customer guidelines, delivery terms, and order policies.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-800 transition mb-6"
      >
        <ArrowLeft size={16} /> Back to Shopping
      </Link>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary-50 text-brand-primary-600 flex items-center justify-center font-bold">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Terms of Service</h1>
            <p className="text-sm text-neutral-500 mt-1">Last updated: September 10, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-neutral-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-primary-600" /> 1. Overview & Account Use
            </h2>
            <p>
              Welcome to GroceryGo. By accessing or purchasing from our platform, you agree to comply with these terms. Accounts must be registered with accurate contact and address details to ensure successful delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Truck size={18} className="text-brand-primary-600" /> 2. Ordering & Delivery Terms
            </h2>
            <p>
              GroceryGo offers farm-fresh fruits, vegetables, dairy, and daily essentials across designated delivery zones in India. All product prices are inclusive of applicable taxes unless stated otherwise.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-neutral-600">
              <li>Deliveries are fulfilled according to selected time slots.</li>
              <li>Fresh produce weight and appearance may vary slightly due to natural sourcing.</li>
              <li>Customers must be available to receive perishable items at the delivery address provided.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <RefreshCw size={18} className="text-brand-primary-600" /> 3. Returns & Refunds
            </h2>
            <p>
              We stand behind product freshness. If you receive damaged or spoiled fresh items, report them within <strong>24 hours</strong> of delivery with clear images for an immediate replacement or full refund to your original payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-brand-primary-600" /> 4. Pricing & Availability
            </h2>
            <p>
              All prices are listed in Indian Rupees (INR ₹). We reserve the right to update product availability, prices, or promo codes at any time prior to order confirmation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
