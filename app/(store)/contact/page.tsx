'use client';

import { Header } from '@/components/shared/Header';
import { useState } from 'react';
import {
  Send,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 99999 99999',
    href: 'tel:+919999999999',
    color: 'text-brand-primary-600',
    bg: 'bg-brand-primary-50',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@krishnaplastics.in',
    href: 'mailto:support@krishnaplastics.in',
    color: 'text-status-success-700',
    bg: 'bg-status-success-50',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Mumbai, Maharashtra, India',
    href: null,
    color: 'text-status-warning-700',
    bg: 'bg-status-warning-50',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header hideSearch />

      <main className="max-w-5xl mx-auto px-4 py-10 mt-20">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={22} className="text-brand-primary-600" />
            <h1 className="text-2xl font-bold text-neutral-900">Contact Us</h1>
          </div>
          <p className="text-neutral-500 text-sm">
            We're here to help. Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: Contact info ── */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex items-start gap-4"
              >
                <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-medium text-neutral-800 hover:text-brand-primary-600 transition"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-neutral-800">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Business hours */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-3">
                Business Hours
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-700">
                  <span>Monday – Saturday</span>
                  <span className="font-medium">9 AM – 7 PM</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-3">
            {status === 'sent' ? (
              <div className="bg-white rounded-2xl border border-status-success-200 shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-status-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-status-success-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Message sent!</h2>
                <p className="text-sm text-neutral-500 mb-6">
                  Thank you for reaching out. We'll reply to your email within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2.5 bg-brand-primary-600 text-white rounded-xl text-sm font-medium hover:bg-brand-primary-700 transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-5">Send us a message</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ramesh Kumar"
                        required
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ramesh@example.com"
                        required
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                    >
                      <option value="">Select a topic…</option>
                      <option value="Order Issue">Order Issue</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Return / Refund">Return / Refund</option>
                      <option value="Bulk Order">Bulk Order</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your question or issue in detail…"
                      required
                      rows={5}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition"
                    />
                  </div>

                  {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-700 disabled:opacity-60 transition"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
