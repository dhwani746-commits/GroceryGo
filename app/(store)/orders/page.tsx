import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderService } from '@/lib/services/order.service';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { ShoppingBag, Package, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Your Orders — Krishna Plastics',
  description: 'Track and view all your orders from Krishna Plastics.',
};

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-status-warning-100 text-status-warning-800 border-status-warning-200',
  paid:       'bg-status-success-100 text-status-success-800 border-status-success-200',
  confirmed:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  cancelled:  'bg-status-danger-100 text-status-danger-800 border-status-danger-200',
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
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
          <div className="space-y-4">
            {orders.map((order) => {
              const badgeCls =
                STATUS_BADGE[order.status] ??
                'bg-neutral-100 text-neutral-700 border-neutral-200';
              const statusLabel =
                order.status.charAt(0).toUpperCase() + order.status.slice(1);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="border-b border-neutral-100 bg-neutral-50/80 px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">
                        Order Placed
                      </p>
                      <p className="font-semibold text-neutral-900 text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">
                        Total
                      </p>
                      <p className="font-semibold text-neutral-900 text-sm">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">
                        Order #
                      </p>
                      <p
                        className="font-mono font-semibold text-neutral-800 text-sm"
                        title={order.id}
                      >
                        {order.id.split('-')[0].toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="px-5 py-4">
                    <ul className="space-y-3">
                      {order.order_items.slice(0, 3).map((item) => {
                        const imgUrl = item.products?.image_urls?.[0];
                        return (
                          <li key={item.id} className="flex gap-3 items-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.product_name}
                                className="w-14 h-14 rounded-xl object-cover border border-neutral-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0">
                                <Package size={18} className="text-neutral-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                Qty: {item.quantity} · {formatCurrency(item.unit_price)} each
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-neutral-900 flex-shrink-0">
                              {formatCurrency(item.line_total)}
                            </p>
                          </li>
                        );
                      })}
                    </ul>

                    {order.order_items.length > 3 && (
                      <p className="text-xs text-neutral-400 mt-2">
                        +{order.order_items.length - 3} more item
                        {order.order_items.length - 3 === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>

                  {/* Footer: View Details link */}
                  <div className="border-t border-neutral-100 px-5 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary-600 hover:text-brand-primary-800 transition"
                    >
                      View Order Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
