import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Categories } from '@/components/store/Categories';
import { ProductSegments } from '@/components/store/ProductSegments';
import { HeroBanner } from '@/components/store/HeroBanner';
import { Truck, BadgeCheck, RefreshCcw, Headphones } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full mt-32">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Trust Signals */}
        <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { icon: Truck,       title: 'Fast Delivery',       sub: 'Right to your doorstep',    color: 'text-brand-primary-600' },
            { icon: BadgeCheck,  title: 'Quality Guaranteed',  sub: 'Durable & tested products', color: 'text-status-success-600' },
            { icon: RefreshCcw,  title: 'Easy Returns',        sub: 'Hassle-free process',       color: 'text-status-warning-600' },
            { icon: Headphones,  title: 'Customer Support',    sub: 'Always here to help',       color: 'text-brand-primary-600' },
          ] as const).map(({ icon: Icon, title, sub, color }) => (
            <div
              key={title}
              className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-brand-primary-500 transition-all"
            >
              <Icon size={22} strokeWidth={1.75} className={`flex-shrink-0 ${color}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">{title}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <Categories />

        {/* Product Segments */}
        <div id="products" className="mt-12">
          <ProductSegments />
        </div>
      </main>

      <Footer />
    </div>
  );
}