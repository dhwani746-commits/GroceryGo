'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  Search,
  Calendar,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  IndianRupee,
  Hash,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { toast } from 'sonner';
import Link from 'next/link';

interface Transaction {
  id: string;
  customer_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  razorpay_payment_id: string;
  razorpay_order_id: string | null;
  created_at: string;
  delivery_address: {
    name: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
  };
  profiles?: { full_name: string | null; phone: string | null } | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-yellow-100  text-yellow-800  border-yellow-200',
  confirmed:  'bg-green-100   text-green-800   border-green-200',
  processing: 'bg-blue-100    text-blue-800    border-blue-200',
  shipped:    'bg-purple-100  text-purple-800  border-purple-200',
  delivered:  'bg-green-100   text-green-800   border-green-200',
  cancelled:  'bg-red-100     text-red-800     border-red-200',
};

// ── Copy-to-clipboard button ───────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      title="Copy to clipboard"
      className="ml-1 p-0.5 rounded hover:bg-gray-200 transition text-gray-400 hover:text-gray-700 flex-shrink-0"
    >
      {copied
        ? <Check size={11} className="text-green-600" />
        : <Copy size={11} />}
    </button>
  );
}

// ── Razorpay dashboard deep-link helper ───────────────────────────────────────
function rzpDashboardUrl(paymentId: string, isTestMode: boolean) {
  // Razorpay dashboard URL is the same for both modes.
  // The user must toggle Test/Live in the Razorpay dashboard themselves.
  // Deep-linking to the payment works in both modes with the same path.
  const base = 'https://dashboard.razorpay.com/app/payments';
  return `${base}/${paymentId}${isTestMode ? '?mode=test' : ''}`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminTransactionsPage() {
  const [transactions, setTransactions]   = useState<Transaction[]>([]);
  const [total, setTotal]                 = useState(0);
  const [isTestMode, setIsTestMode]       = useState<boolean | null>(null);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');

  const pageSize   = 20;
  const totalPages = Math.ceil(total / pageSize);

  // Client-side name filter applied on top of server-side payment-id filter
  const filtered = search.trim()
    ? transactions.filter((t) => {
        const q = search.toLowerCase();
        const name = (t.profiles?.full_name ?? t.delivery_address.name).toLowerCase();
        return (
          t.razorpay_payment_id.toLowerCase().includes(q) ||
          (t.razorpay_order_id?.toLowerCase().includes(q) ?? false) ||
          name.includes(q)
        );
      })
    : transactions;

  const totalRevenue = filtered.reduce((s, t) => s + t.total_amount, 0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:     String(page),
        pageSize: String(pageSize),
        ...(dateFrom       ? { dateFrom } : {}),
        ...(dateTo         ? { dateTo   } : {}),
      });

      const res  = await fetch(`/api/admin/transactions?${params}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();

      setTransactions(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
      setIsTestMode(json.meta?.isTestMode ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to load transactions: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminBreadcrumbs items={[{ label: 'Transactions' }]} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={22} className="text-brand-primary-600" />
            Razorpay Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} online payment{total !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Test-mode / Live-mode banner */}
      {isTestMode !== null && (
        isTestMode ? (
          <div className="flex items-start gap-3 mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <FlaskConical size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Test Mode Active</p>
              <p className="text-amber-700 mt-0.5">
                Your Razorpay key starts with <code className="bg-amber-100 px-1 rounded font-mono text-xs">rzp_test_</code>.
                These are <strong>simulated payments</strong> — no real money was collected.
                To view them in Razorpay, open your{' '}
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-900"
                >
                  Razorpay Dashboard
                </a>{' '}
                and toggle <strong>Test Mode ON</strong> using the switch in the top navigation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 mb-5 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Live Mode Active</p>
              <p className="text-green-700 mt-0.5">
                Real payments are being processed. View them in your{' '}
                <a
                  href="https://dashboard.razorpay.com/app/payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-900"
                >
                  Razorpay Dashboard → Payments
                </a>.
              </p>
            </div>
          </div>
        )
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Hash size={12} /> Total Transactions
          </p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <IndianRupee size={12} /> Revenue (visible)
          </p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> Avg. Order Value
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {filtered.length > 0 ? formatCurrency(totalRevenue / filtered.length) : '—'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payment ID, order ID or customer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-primary-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {total === 0
                ? 'No Razorpay transactions recorded yet'
                : 'No transactions match your filters'}
            </p>
            {total === 0 && isTestMode && (
              <p className="text-xs mt-2 text-amber-600 flex items-center justify-center gap-1">
                <AlertTriangle size={12} />
                Make a test payment on the checkout page to see it here
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Payment ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Razorpay Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date &amp; Time</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((txn) => {
                    const badge = STATUS_BADGE[txn.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';
                    return (
                      <tr key={txn.id} className="hover:bg-gray-50 transition">
                        {/* Payment ID */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            <span className="font-mono text-xs text-brand-primary-700 font-semibold truncate max-w-[150px]" title={txn.razorpay_payment_id}>
                              {txn.razorpay_payment_id}
                            </span>
                            <CopyButton value={txn.razorpay_payment_id} />
                          </div>
                          {isTestMode && (
                            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                              <FlaskConical size={9} /> test
                            </span>
                          )}
                        </td>

                        {/* Razorpay Order ID */}
                        <td className="px-4 py-3">
                          {txn.razorpay_order_id ? (
                            <div className="flex items-center gap-0.5">
                              <span className="font-mono text-xs text-gray-500 truncate max-w-[140px]" title={txn.razorpay_order_id}>
                                {txn.razorpay_order_id}
                              </span>
                              <CopyButton value={txn.razorpay_order_id} />
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[140px]">
                            {txn.profiles?.full_name ?? txn.delivery_address.name}
                          </p>
                          <p className="text-xs text-gray-400">{txn.delivery_address.city}, {txn.delivery_address.state}</p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          <p>{new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(txn.total_amount)}</p>
                          {txn.discount_amount > 0 && (
                            <p className="text-xs text-green-600">−{formatCurrency(txn.discount_amount)} off</p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge}`}>
                            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/orders/${txn.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
                            >
                              Order <ExternalLink size={10} />
                            </Link>
                            <a
                              href={rzpDashboardUrl(txn.razorpay_payment_id, isTestMode ?? false)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={isTestMode ? 'Open in Razorpay (ensure Test Mode is ON in Razorpay Dashboard)' : 'Open in Razorpay'}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#072654] text-white rounded-lg hover:bg-[#0a3578] transition whitespace-nowrap"
                            >
                              Razorpay <ExternalLink size={10} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((txn) => {
                const badge = STATUS_BADGE[txn.status] ?? 'bg-gray-100 text-gray-800 border-gray-200';
                return (
                  <div key={txn.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-brand-primary-700 break-all">
                            {txn.razorpay_payment_id}
                          </span>
                          <CopyButton value={txn.razorpay_payment_id} />
                          {isTestMode && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                              <FlaskConical size={9} /> test
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                          {txn.profiles?.full_name ?? txn.delivery_address.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {txn.delivery_address.city}, {txn.delivery_address.state}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">{formatCurrency(txn.total_amount)}</p>
                        {txn.discount_amount > 0 && (
                          <p className="text-xs text-green-600">−{formatCurrency(txn.discount_amount)}</p>
                        )}
                        <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge}`}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400">
                      {new Date(txn.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>

                    {txn.razorpay_order_id && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 flex-shrink-0">Order ID:</span>
                        <span className="font-mono text-xs text-gray-500 truncate">{txn.razorpay_order_id}</span>
                        <CopyButton value={txn.razorpay_order_id} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/orders/${txn.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        View Order <ExternalLink size={11} />
                      </Link>
                      <a
                        href={rzpDashboardUrl(txn.razorpay_payment_id, isTestMode ?? false)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-[#072654] text-white rounded-lg hover:bg-[#0a3578] transition"
                      >
                        Razorpay <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm gap-3">
          <p className="text-gray-500">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex-1 sm:flex-none px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-none px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* How to view in Razorpay Dashboard */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <CreditCard size={15} className="text-brand-primary-600" />
          How to view these payments in the Razorpay Dashboard
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>
            Go to{' '}
            <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer"
              className="text-brand-primary-600 underline hover:text-brand-primary-700">
              dashboard.razorpay.com
            </a>{' '}
            and sign in.
          </li>
          {isTestMode && (
            <li>
              <strong>Toggle Test Mode ON</strong> using the switch in the top navigation bar —
              test payments are only visible in Test mode.
            </li>
          )}
          <li>
            Navigate to <strong>Transactions → Payments</strong> in the left sidebar.
          </li>
          <li>
            Use the <strong>Payment ID</strong> (copy from above) to search for a specific transaction.
          </li>
          {!isTestMode && (
            <li>
              Settlement reports are available under <strong>Transactions → Settlements</strong>.
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
