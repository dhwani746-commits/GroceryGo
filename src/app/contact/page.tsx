'use client';

import { Header } from '@/components/Header';
import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
        credentials: 'same-origin',
      });

      if (res.ok) {
        setStatus('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return ( 
      <>
      <Header />
      <main className="max-w-3xl mx-auto  mt-30 px-4 py-12">
        <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
        <p className="text-neutral-600 mb-6">Have a question or feedback? Send us a message and we'll get back to you.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border px-3 py-2 rounded-md h-36" />
          </div>

          <div>
            <button type="submit" disabled={status === 'sending'} className="bg-brand-accent-500 text-white px-4 py-2 rounded-md">
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>

        {status === 'sent' && <p className="mt-4 text-status-success-700">Message sent — we'll reply soon.</p>}
        {status === 'error' && <p className="mt-4 text-status-danger-700">Failed to send message. Try again later.</p>}
      </main>
    </>
  );
}
