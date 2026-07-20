'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

// ── Quick-date helpers (same pattern as admin/orders) ─────────────────────────
function toDateStr(d: Date) {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local TZ
}

const DATE_PRESETS = [
  {
    label: 'Today',
    get: () => { const d = toDateStr(new Date()); return { from: d, to: d }; },
  },
  {
    label: 'This Week',
    get: () => {
      const now = new Date();
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      return { from: toDateStr(mon), to: toDateStr(now) };
    },
  },
  {
    label: 'This Month',
    get: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toDateStr(first), to: toDateStr(now) };
    },
  },
] as const;

// ── Revenue chart ─────────────────────────────────────────────────────────────
function RevenueChart({ transactions }: { transactions: Transaction[] }) {
  // Group revenue by day
  const points = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      const day = toDateStr(new Date(t.created_at));
      map.set(day, (map.get(day) ?? 0) + t.total_amount);
    }
    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([date, revenue]) => ({ date, revenue }));
  }, [transactions]);

  if (points.length === 0) return null;

  const W = 700, H = 200, PAD = { top: 16, right: 16, bottom: 40, left: 64 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...points.map((p) => p.revenue), 1);
  const minRev = 0;

  const xScale = (i: number) =>
    points.length === 1 ? PAD.left + innerW / 2 : PAD.left + (i / (points.length - 1)) * innerW;
  const yScale = (v: number) =>
    PAD.top + innerH - ((v - minRev) / (maxRev - minRev)) * innerH;

  // Smooth polyline path
  const pathD = points.reduce((acc, p, i) => {
    const x = xScale(i);
    const y = yScale(p.revenue);
    return i === 0 ? `M${x},${y}` : `${acc} L${x},${y}`;
  }, '');

  // Filled area
  const areaD = `${pathD} L${xScale(points.length - 1)},${PAD.top + innerH} L${xScale(0)},${PAD.top + innerH} Z`;

  // Y-axis ticks (4 levels)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: minRev + f * (maxRev - minRev),
    y: PAD.top + innerH - f * innerH,
  }));

  // X-axis labels — show max 6 evenly spaced
  const xLabels = points.length <= 6
    ? points.map((p, i) => ({ ...p, i }))
    : [0, 1, 2, 3, 4, 5].map((slot) => {
        const i = Math.round((slot / 5) * (points.length - 1));
        return { ...points[i], i };
      });

  // Tooltip state
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-primary-600" />
          <h2 className="font-semibold text-gray-900">Revenue Growth</h2>
        </div>
        <span className="text-xs text-gray-400">
          {points[0]?.date} → {points[points.length - 1]?.date}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 320 }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((t) => (
            <g key={t.value}>
              <line
                x1={PAD.left} y1={t.y}
                x2={PAD.left + innerW} y2={t.y}
                stroke="#f3f4f6" strokeWidth="1"
              />
              <text
                x={PAD.left - 8} y={t.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
              >
                {t.value >= 1000
                  ? `₹${(t.value / 1000).toFixed(t.value % 1000 === 0 ? 0 : 1)}k`
                  : `₹${Math.round(t.value)}`}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#revGrad)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data points + hover targets */}
          {points.map((p, i) => {
            const x = xScale(i);
            const y = yScale(p.revenue);
            return (
              <g key={i}>
                {/* Invisible wide hit area */}
                <rect
                  x={i === 0 ? PAD.left : (xScale(i - 1) + x) / 2}
                  y={PAD.top}
                  width={
                    points.length === 1
                      ? innerW
                      : i === 0
                        ? (x - PAD.left + (xScale(1) - x) / 2)
                        : i === points.length - 1
                          ? ((x - xScale(i - 1)) / 2 + PAD.left + innerW - x)
                          : (xScale(i + 1) - xScale(i - 1)) / 2
                  }
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover({ i, x, y })}
                />
                {/* Visible dot on hover */}
                {hover?.i === i && (
                  <circle cx={x} cy={y} r={5} fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {hover !== null && (() => {
            const p = points[hover.i];
            const tipW = 110, tipH = 46;
            const tx = Math.min(Math.max(hover.x - tipW / 2, PAD.left), PAD.left + innerW - tipW);
            // Place tooltip BELOW the dot; clamp so it never overflows SVG bottom
            const tyBelow = hover.y + 12;
            const ty = Math.min(tyBelow, H - tipH - 4);
            return (
              <g>
                <rect x={tx} y={ty} width={tipW} height={tipH} rx="6" fill="#1e293b" />
                <text x={tx + tipW / 2} y={ty + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </text>
                <text x={tx + tipW / 2} y={ty + 34} textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
                  {formatCurrency(p.revenue)}
                </text>
              </g>
            );
          })()}

          {/* X-axis labels */}
          {xLabels.map(({ date, i }) => (
            <text
              key={i}
              x={xScale(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Copy-to-clipboard button ──────────────────────────────────────────────────
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
  const [activePreset, setActivePreset]   = useState<string | null>(null);

  const pageSize   = 20;
  const totalPages = Math.ceil(total / pageSize);

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    const { from, to } = preset.get();
    setDateFrom(from);
    setDateTo(to);
    setActivePreset(preset.label);
    setPage(1);
  };

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
    setActivePreset(null);
    setPage(1);
  };

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
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo   ? { dateTo   } : {}),
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

      {/* Revenue chart */}
      {!loading && filtered.length > 0 && (
        <RevenueChart transactions={filtered} />
      )}

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

        {/* Date presets + date range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick preset buttons */}
          {DATE_PRESETS.map((preset) => {
            const isActive = activePreset === preset.label;
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-brand-primary-50 text-brand-primary-700 border-brand-primary-200 ring-1 ring-brand-primary-100/50 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Divider */}
          <span className="text-gray-300 hidden sm:inline">|</span>

          {/* Date inputs — narrow */}
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setActivePreset(null); setPage(1); }}
              className="w-32 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-50 transition-all font-medium text-neutral-700 outline-none shadow-inner/5"
              title="From date"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setActivePreset(null); setPage(1); }}
              className="w-32 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-50 transition-all font-medium text-neutral-700 outline-none shadow-inner/5"
              title="To date"
            />
          </div>

          {/* Clear dates */}
          {(dateFrom || dateTo) && (
            <button
              onClick={clearDates}
              className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all active:scale-95 font-medium"
            >
              Clear
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
