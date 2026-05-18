import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Replicates the same requireAdmin() pattern used in /api/admin/orders/route.ts.
 * Role is stored as lowercase 'admin' in the profiles table.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // role is stored as lowercase 'admin' in the DB
  if (profile?.role !== 'admin') return null;
  return user;
}

/**
 * GET /api/admin/transactions
 *
 * Returns all orders that were paid via Razorpay (razorpay_payment_id IS NOT NULL).
 * Includes a mode indicator so the UI can warn when test-mode keys are in use.
 *
 * Query params:
 *   page      (default 1)
 *   pageSize  (default 20, max 100)
 *   dateFrom  ISO date string  (optional)
 *   dateTo    ISO date string  (optional)
 *   search    partial match on razorpay_payment_id or customer name (optional)
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminClient(); // bypass RLS to read all orders

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1',  10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10));
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo   = searchParams.get('dateTo')   ?? '';
  const search   = searchParams.get('search')   ?? '';

  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select(
      `
        id,
        customer_id,
        status,
        subtotal,
        discount_amount,
        total_amount,
        razorpay_payment_id,
        razorpay_order_id,
        created_at,
        delivery_address,
        profiles ( full_name, phone )
      `,
      { count: 'exact' },
    )
    .not('razorpay_payment_id', 'is', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (dateFrom) {
    query = query.gte('created_at', new Date(dateFrom).toISOString());
  }
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte('created_at', end.toISOString());
  }
  if (search.trim()) {
    // ilike on payment_id — name search is done client-side from the returned payload
    query = query.ilike('razorpay_payment_id', `%${search.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('GET /api/admin/transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }

  // Tell the client whether we are in test or live mode so it can show a badge.
  const isTestMode = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '').startsWith('rzp_test_');

  return NextResponse.json({
    success: true,
    data:    data ?? [],
    meta: {
      total:      count ?? 0,
      page,
      pageSize,
      pages:      Math.ceil((count ?? 0) / pageSize),
      isTestMode,
    },
  });
}
