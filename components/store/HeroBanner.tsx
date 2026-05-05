import Link from 'next/link';
import { ShoppingBag, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary-700 via-brand-primary-600 to-brand-accent-600 text-white mb-12">
      {/* Decorative background bubbles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-24 h-24 bg-brand-accent-400/20 rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="relative px-6 py-10 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center gap-8">
        {/* Left: Text Content */}
        <div className="flex-1 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} />
            Quality Since 1995
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Premium Plastics for<br />
            <span className="text-brand-accent-200">Every Indian Home</span>
          </h1>

          {/* Subheading */}
          <p className="text-white/80 text-base md:text-lg max-w-md leading-relaxed">
            Durable buckets, containers, storage solutions &amp; more. Trusted by thousands of families across India.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="#products"
              className="inline-flex items-center gap-2 bg-white text-brand-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-accent-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
            >
              <ShoppingBag size={16} />
              Shop Now
            </Link>
            <Link
              href="/search?q="
              className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm"
            >
              Browse All
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <Truck size={14} className="text-brand-accent-200" />
              Fast Delivery
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <ShieldCheck size={14} className="text-brand-accent-200" />
              Quality Guaranteed
            </div>
          </div>
        </div>

        {/* Right: Visual Element (floating product icons) */}
        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <div className="relative w-64 h-64">
            {/* Center circle */}
            <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm" />

            {/* Floating product icons */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
              🪣
            </div>
            <div className="absolute top-1/4 -right-6 w-14 h-14 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
              📦
            </div>
            <div className="absolute bottom-4 -right-2 w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-xl shadow-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              🧴
            </div>
            <div className="absolute top-1/4 -left-6 w-14 h-14 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.3s' }}>
              🗑️
            </div>
            <div className="absolute bottom-4 left-0 w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-xl shadow-lg animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '0.8s' }}>
              🧺
            </div>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black">KP</span>
              <span className="text-xs font-semibold text-white/70 mt-1">Krishna Plastics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
