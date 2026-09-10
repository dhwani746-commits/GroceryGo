'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, Package } from 'lucide-react';

/**
 * Root not-found.tsx — Next.js renders this automatically for every 404
 * across the entire app (store, admin, api misses, etc.).
 * Also invoked explicitly by the catch-all route [...catchAll]/page.tsx.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">

      {/* Minimal header strip */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-2">
        <Package size={20} className="text-brand-primary-600" />
        <Link href="/" className="text-base font-bold text-neutral-900 hover:text-brand-primary-600 transition">
          GroceryGo
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">

        {/* Illustrated number */}
        <div className="relative mb-4 select-none">
          <p className="text-[10rem] sm:text-[14rem] font-black text-neutral-500 leading-none tracking-tighter">
            404
          </p>
        </div>

        {/* Copy */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
          Page not found
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base max-w-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-700 transition shadow-sm"
          >
            <Home size={16} />
            Back to Home
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 text-sm font-medium rounded-xl border border-neutral-200 hover:bg-neutral-50 transition shadow-sm"
          >
            <Search size={16} />
            Browse All Products
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition"
        >
          <ArrowLeft size={14} /> Go back to previous page
        </button>

      </main>

      {/* Footer strip */}
      <footer className="py-4 text-center text-md text-neutral-400 border-t border-neutral-100">
        © {new Date().getFullYear()} GroceryGo. All rights reserved.
      </footer>
    </div>
  );
}
