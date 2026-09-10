import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { CategoryIcons } from '@/components/store/CategoryIcons';
import { ProductSegments } from '@/components/store/ProductSegments';
import { HeroBanner } from '@/components/store/HeroBanner';
import { Truck, BadgeCheck, RefreshCcw, Headphones } from 'lucide-react';

import { GroceryCardScroll } from '@/components/store/GroceryCardScroll';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Categories Section - Directly Below Header */}
      <div className="bg-white border-b border-neutral-200 mt-30 lg:mt-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CategoryIcons />
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Interactive Skiper UI Grocery Card Scroll */}
        <GroceryCardScroll />

        {/* Product Segments */}
        <div id="products" className="mt-12">
          <ProductSegments />
        </div>
      </main>

      <Footer />
    </div>
  );
}