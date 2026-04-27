import { Header } from '@/components/shared/Header';
import { Categories } from '@/components/store/Categories';
import { ProductSegments } from '@/components/store/ProductSegments';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full mt-32">
        {/* Categories Section */}
        <Categories />

        {/* Best Seller Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Seller Products</h2>
          <ProductSegments />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2026 PlastiKart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}