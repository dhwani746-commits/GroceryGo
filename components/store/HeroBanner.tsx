'use client';

import Link from 'next/link';
import { ShoppingBag, Truck, ShieldCheck, Sparkles, BadgeCheck, RefreshCcw, Headphones, Zap, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link001, Link002, Link004, Link005 } from '@/components/ui/skiper-ui/skiper40';

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const trustSignals = [
    { icon: Truck, title: 'Superfast 30-Min Delivery', sub: 'Direct from local farms & hubs', color: 'text-amber-300' },
    { icon: BadgeCheck, title: '100% Quality Guaranteed', sub: 'Handpicked fresh items daily', color: 'text-amber-300' },
    { icon: RefreshCcw, title: 'Instant Doorstep Returns', sub: 'No questions asked policy', color: 'text-amber-300' },
    { icon: Headphones, title: '24/7 Dedicated Support', sub: 'Always here to assist your order', color: 'text-amber-300' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trustSignals.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [trustSignals.length]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary-900 via-brand-primary-800 to-brand-accent-800 text-white mb-12 shadow-2xl border border-white/10">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent-500/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-primary-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative px-5 py-10 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Main Banner Content */}
        <div className="flex-1 space-y-5 max-w-2xl">
          {/* Fresh Delivery Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-inner">
            <Zap size={14} className="text-amber-400 fill-amber-400" />
            <span>30-Min Express Delivery • Farm Fresh Daily</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Fresh Groceries for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-brand-accent-200 to-emerald-300">
              Every Indian Home
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-white/85 text-sm sm:text-lg max-w-lg leading-relaxed font-normal">
            Order farm-fresh vegetables, organic fruits, daily milk, staples &amp; household essentials at wholesale prices.
          </p>

          {/* Skiper UI Mobile-Specific Interactive Feature Bar (Visible on Mobile) */}
          <div className="block md:hidden bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles size={12} /> Shop by Category
            </div>
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
              <Link004 href="#products" className="text-xs font-bold text-white py-1">
                🥦 Fresh Vegetables
              </Link004>
              <Link004 href="/search?q=milk" className="text-xs font-bold text-white py-1">
                🥛 Daily Milk &amp; Dairy
              </Link004>
              <Link004 href="/search?q=rice" className="text-xs font-bold text-white py-1">
                🌾 Rice &amp; Staples
              </Link004>
            </div>
          </div>

          {/* Desktop & Mobile CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#products"
              className="inline-flex items-center gap-2.5 bg-white text-brand-primary-900 font-extrabold px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl hover:bg-amber-300 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Order Groceries Now</span>
            </Link>

            {/* Skiper UI Animated Link005 */}
            <div className="inline-block">
              <Link005
                href="/search?q="
                className="text-white font-bold text-sm py-2 px-3 tracking-wide"
              >
                Browse Full Catalog
              </Link005>
            </div>
          </div>

          {/* Trust Signals Slider */}
          <div className="pt-5 border-t border-white/10">
            <div className="relative overflow-hidden">
              <div className="flex items-center">
                <div className="relative w-full max-w-md">
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {trustSignals.map((signal) => {
                        const Icon = signal.icon;
                        return (
                          <div key={signal.title} className="w-full flex-shrink-0">
                            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-lg">
                              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                                <Icon size={22} className={signal.color} />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white">{signal.title}</h4>
                                <p className="text-[11px] text-white/80">{signal.sub}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-2 mt-3">
                {trustSignals.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentSlide 
                        ? 'bg-amber-300 w-7' 
                        : 'bg-white/30 hover:bg-white/60 w-2'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Floating Orbit Visual (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 rounded-full bg-white/5 border border-white/20 backdrop-blur-md shadow-2xl animate-spin-slow" style={{ animationDuration: '25s' }} />

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-3xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
              🍎
            </div>
            <div className="absolute top-1/4 -right-6 w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
              🥛
            </div>
            <div className="absolute bottom-4 -right-2 w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              🥦
            </div>
            <div className="absolute top-1/4 -left-6 w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.3s' }}>
              🍞
            </div>
            <div className="absolute bottom-4 left-0 w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '0.8s' }}>
              🍫
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-white">
                GG
              </span>
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-widest mt-1">
                GroceryGo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
