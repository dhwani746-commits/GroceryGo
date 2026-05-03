import { Footer } from '@/components/shared/Footer';

/**
 * Layout for the customer-facing (store) route group.
 * Adds the Footer to every store page automatically — checkout, orders,
 * product detail, search, contact, addresses, auth, etc.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <Footer />
    </div>
  );
}
