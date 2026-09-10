import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderRepository } from '@/lib/repositories/order.repository';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Home,
  ShoppingBag,
  FileText,
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Order ${id.split('-')[0].toUpperCase()} — GroceryGo` };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-status-warning-800', bg: 'bg-status-warning-100', border: 'border-status-warning-200' },
  paid: { label: 'Paid', color: 'text-status-success-800', bg: 'bg-status-success-100', border: 'border-status-success-200' },
  confirmed: { label: 'Confirmed', color: 'text-status-success-800', bg: 'bg-status-success-100', border: 'border-status-success-200' },
  processing: { label: 'Processing', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-200' },
  shipped: { label: 'Shipped', color: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-200' },
  delivered: { label: 'Delivered', color: 'text-status-success-800', bg: 'bg-status-success-100', border: 'border-status-success-200' },
  cancelled: { label: 'Cancelled', color: 'text-status-danger-800', bg: 'bg-status-danger-100', border: 'border-status-danger-200' },
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;
  const { success } = await searchParams;

  if (!user) {
    redirect(`/auth/login?redirect=/orders/${id}`);
  }

  const order = await OrderRepository.getOrderById(id, user.id);

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header hideSearch />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-16 text-center">
          <ShoppingBag size={48} className="mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Order not found</h1>
          <p className="text-neutral-500 mb-6">This order doesn't exist or belongs to another account.</p>
          <Link href="/orders" className="text-brand-primary-600 hover:underline font-medium">
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
  const address = order.delivery_address;
  const isSuccess = success === '1';
  const activeStep = TIMELINE_STEPS.indexOf(order.status as typeof TIMELINE_STEPS[number]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header hideSearch />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'My Orders', href: '/orders' },
              { label: `Order #${order.id.split('-')[0].toUpperCase()}` }
            ]}
          />
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-6 flex items-start gap-3 bg-status-success-50 border border-status-success-200 rounded-2xl px-5 py-4">
            <CheckCircle2 size={24} className="text-status-success-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-status-success-800">Order placed successfully!</p>
              <p className="text-sm text-status-success-700 mt-0.5">
                We'll confirm your order shortly and keep you updated.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Order Items ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Status card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-600">Order Status</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Timeline (hidden for cancelled orders) */}
              {order.status !== 'cancelled' && activeStep >= 0 && (
                <div className="flex items-center gap-0">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeStep;
                    const isLast = idx === TIMELINE_STEPS.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className={`flex flex-col items-center`}>
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isCompleted ? 'bg-brand-primary-600' : 'bg-neutral-200'}`} />
                          <span className={`text-[10px] mt-1 hidden sm:block ${isCompleted ? 'text-brand-primary-700 font-medium' : 'text-neutral-400'}`}>
                            {STATUS_CONFIG[step]?.label ?? step}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-0.5 mx-1 ${idx < activeStep ? 'bg-brand-primary-600' : 'bg-neutral-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-neutral-400 mt-3">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-neutral-500" />
                <h2 className="font-semibold text-neutral-900">Items Ordered</h2>
              </div>
              <ul className="divide-y divide-neutral-100">
                {order.order_items.map((item) => {
                  const imgUrl = item.products?.image_urls?.[0];
                  return (
                    <li key={item.id} className="py-4 flex gap-4 items-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.product_name}
                          className="w-16 h-16 rounded-xl object-cover border border-neutral-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                          <Package size={20} className="text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">{item.product_name}</p>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-neutral-900 flex-shrink-0">
                        {formatCurrency(item.line_total)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── Right: Summary & Address ── */}
          <div className="space-y-4">
            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-status-success-700 font-medium">
                    <span>Discount</span>
                    <span>−{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="text-status-success-700">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                {order.status === 'delivered' && (
                  <div className="pt-4 border-t border-neutral-100 mt-4">
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary-50 hover:bg-brand-primary-100 text-brand-primary-700 border border-brand-primary-200 rounded-xl transition text-sm font-semibold active:scale-95 text-center"
                    >
                      <FileText size={16} />
                      Download Invoice
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-neutral-500" />
                <h3 className="font-semibold text-neutral-900">Delivery Address</h3>
              </div>
              <address className="text-sm text-neutral-600 not-italic leading-relaxed">
                <p className="font-medium text-neutral-900">{address.name}</p>
                <p>{address.phone}</p>
                <p className="mt-1">{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} — {address.pincode}</p>
              </address>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
