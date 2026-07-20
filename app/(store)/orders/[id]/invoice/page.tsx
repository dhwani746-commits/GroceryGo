import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { OrderRepository } from '@/lib/repositories/order.repository';
import { SettingsRepository } from '@/lib/repositories/settings.repository';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { InvoiceToolbar } from '@/components/store/InvoiceToolbar';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Invoice ${id.split('-')[0].toUpperCase()} — PlastiKart` };
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) {
    redirect(`/auth/login?redirect=/orders/${id}/invoice`);
  }

  // Load order and store settings concurrently
  const [order, storeSettings] = await Promise.all([
    OrderRepository.getOrderById(id, user.id),
    SettingsRepository.getOne(),
  ]);

  // Security checks: only let owners access the page, and only if delivered
  if (!order || order.status !== 'delivered') {
    redirect(`/orders/${id}`);
  }

  const address = order.delivery_address;
  const shortId = order.id.split('-')[0].toUpperCase();
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-4 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
      
      {/* Print Toolbar Header (Hidden during Print) */}
      <InvoiceToolbar orderId={order.id} />

      {/* Invoice Sheet container */}
      <div id="invoice-sheet" className="w-full max-w-4xl bg-white border border-neutral-200 shadow-lg rounded-2xl p-8 sm:p-12 print:shadow-none print:border-none print:rounded-none print:p-0 flex flex-col justify-between min-h-[11in] text-neutral-800">
        
        <div>
          {/* Header section: Logo & Document Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Receipt size={24} className="text-brand-primary-600" />
                <span className="text-2xl font-bold text-neutral-900">{storeSettings.store_name}</span>
              </div>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                {storeSettings.address_line1} {storeSettings.address_line2 && `, ${storeSettings.address_line2}`}
                <br />
                {storeSettings.city}, {storeSettings.state} — {storeSettings.pincode}
                <br />
                Email: {storeSettings.support_email} • Tel: {storeSettings.support_phone}
              </p>
            </div>
            <div className="text-right sm:text-right self-end sm:self-center">
              <h1 className="text-xl font-bold text-neutral-900 tracking-wider uppercase">Tax Invoice</h1>
              <p className="text-xs text-neutral-500 mt-1">Invoice No: <span className="font-semibold text-neutral-900">INV-{shortId}</span></p>
              <p className="text-xs text-neutral-500">Date: <span className="font-semibold text-neutral-900">{invoiceDate}</span></p>
            </div>
          </div>

          {/* Details column (Billing & Shipping) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-neutral-100 text-sm">
            <div>
              <h2 className="font-bold text-neutral-900 uppercase tracking-wider text-xs mb-3 text-neutral-500">Billed &amp; Shipped To:</h2>
              <p className="font-bold text-neutral-900 text-base">{address.name}</p>
              <p className="text-neutral-600 mt-1">Phone: {address.phone}</p>
              <address className="text-neutral-600 not-italic leading-relaxed mt-2 whitespace-pre-line">
                {address.line1}
                {address.line2 && `\n${address.line2}`}
                {`\n${address.city}, ${address.state} — ${address.pincode}`}
              </address>
            </div>
            <div className="sm:text-right">
              <h2 className="font-bold text-neutral-900 uppercase tracking-wider text-xs mb-3 text-neutral-500">Order Information:</h2>
              <p className="text-neutral-600">Order ID: <span className="font-semibold text-neutral-900">{order.id}</span></p>
              <p className="text-neutral-600 mt-1">Order Date: <span className="font-semibold text-neutral-900">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
              {storeSettings.gst_number && (
                <p className="text-neutral-600 mt-1">Seller GSTIN: <span className="font-semibold text-neutral-900">{storeSettings.gst_number}</span></p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="py-8">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-center">#</th>
                  <th className="px-4 py-2.5 text-left">Description</th>
                  <th className="px-4 py-2.5 text-right w-24">Rate</th>
                  <th className="px-4 py-2.5 text-center w-16">Qty</th>
                  <th className="px-4 py-2.5 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {order.order_items.map((item, idx) => (
                  <tr key={item.id} className="align-middle">
                    <td className="px-4 py-4 text-center text-neutral-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-4 font-semibold text-neutral-900">{item.product_name}</td>
                    <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-4 text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-semibold">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Footer section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start pt-6 border-t border-neutral-200 gap-6">
            <div className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              <p className="font-semibold text-neutral-800 mb-1">Declaration / Terms:</p>
              <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. All prices include applicable taxes.</p>
            </div>
            
            {/* Summary */}
            <div className="w-full sm:w-80 text-sm space-y-2.5">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount Applied:</span>
                  <span>−{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charges:</span>
                <span className="text-green-700">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Amount:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Computer generation declaration */}
          <div className="text-center text-xs text-neutral-400 mt-16 pt-6 border-t border-neutral-100">
            This is a computer-generated invoice and does not require a physical signature.
            <br />
            Thank you for shopping with {storeSettings.store_name}!
          </div>
        </div>

      </div>
    </div>
  );
}
