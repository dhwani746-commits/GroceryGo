'use client';

import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Package, ChevronRight, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-status-warning-100 text-status-warning-800 border-status-warning-200',
  paid:       'bg-status-success-100 text-status-success-800 border-status-success-200',
  confirmed:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-status-success-100 text-status-success-800 border-status-success-200',
  cancelled:  'bg-status-danger-100 text-status-danger-800 border-status-danger-200',
};

interface OrdersClientProps {
  orders: any[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order: any) => {
        const badgeCls =
          STATUS_BADGE[order.status] ??
          'bg-neutral-100 text-neutral-700 border-neutral-200';
        const statusLabel =
          order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const isExpanded = expandedOrders.has(order.id);

        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
          >
            {/* Order header */}
            <div className="border-b border-neutral-100 bg-neutral-50/80 px-5 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="md:text-right mr-20">
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

              {/* Expand/Collapse toggle */}
              <button
                onClick={() => toggleOrderExpansion(order.id)}
                className="absolute top-4 right-4 p-2 text-black bg-whitehover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Collapsible content */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 py-4">
                <ul className="space-y-3">
                  {order.order_items.slice(0, 3).map((item: any) => {
                    const imgUrl = item.products?.image_urls?.[0];
                    return (
                      <li key={item.id} className="flex gap-3 items-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product_name}
                            className="w-14 h-14 rounded-xl object-cover border border-neutral-100 flex-shrink-0"
                            sizes="80px"
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
  );
}
