import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — GroceryGo',
  description: 'GroceryGo Privacy Policy: Learn how we protect your personal information and data privacy.',
};

export default function PrivacyPage() {
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
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Privacy Policy</h1>
            <p className="text-sm text-neutral-500 mt-1">Last updated: September 10, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-neutral-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Lock size={18} className="text-brand-primary-600" /> 1. Information We Collect
            </h2>
            <p>
              At GroceryGo, we respect your privacy and are committed to protecting your personal data. We collect information you provide directly to us when creating an account, placing an order, contacting support, or subscribing to offers.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-neutral-600">
              <td><strong>Account Details:</strong> Name, email address, phone number, and delivery addresses.</td>
              <td><strong>Order & Payment Details:</strong> Items purchased, order history, and payment status via secure gateways (Razorpay).</td>
              <td><strong>Device & Usage Data:</strong> IP address, browser type, and navigation patterns on GroceryGo.</td>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Eye size={18} className="text-brand-primary-600" /> 2. How We Use Your Information
            </h2>
            <p>
              Your data is exclusively used to fulfill your grocery orders, process payments, communicate order statuses, and enhance your shopping experience.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-neutral-600">
              <li>Processing and delivering fresh groceries to your doorstep</li>
              <li>Sending transactional SMS, Email, or WhatsApp notifications regarding order progress</li>
              <li>Improving catalog suggestions and user interface responsiveness</li>
              <li>Preventing fraudulent orders and maintaining platform security</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText size={18} className="text-brand-primary-600" /> 3. Data Sharing & Protection
            </h2>
            <p>
              We do <strong>NOT</strong> sell, rent, or trade your personal information to third parties. We share data only with essential operational service providers (such as payment processors and local delivery partners) required to fulfill your orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Bell size={18} className="text-brand-primary-600" /> 4. Contact Our Privacy Team
            </h2>
            <p>
              If you have any questions or wish to delete your account data, please contact our support team at{' '}
              <a href="mailto:support@grocerygo.in" className="text-brand-primary-600 font-semibold hover:underline">
                support@grocerygo.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
