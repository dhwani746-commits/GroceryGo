import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderService } from '@/lib/services/order.service';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ShoppingBag, Package, ChevronDown, ChevronUp } from 'lucide-react';
import OrdersClient from '@/components/store/OrdersClient';

export const metadata = {
  title: 'Your Orders — Krishna Plastics',
  description: 'Track and view all your orders from Krishna Plastics.',
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/orders');
  }

  const orders = await OrderService.getUserOrders(user.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header hideSearch />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-15">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: 'Your Orders' }]}
          className="mb-6"
        />

        <div className="flex items-center gap-2 mb-8">
          <ShoppingBag size={22} className="text-brand-primary-600" />
          <h1 className="text-2xl font-bold text-neutral-900">Your Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-600 mb-2 text-lg font-medium">No orders yet</p>
            <p className="text-neutral-400 text-sm mb-6">
              Start shopping to see your orders here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-primary-600 text-white px-6 py-3 rounded-xl hover:bg-brand-primary-700 transition font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <OrdersClient orders={orders} />
        )}
      </div>
    </div>
  );
}
