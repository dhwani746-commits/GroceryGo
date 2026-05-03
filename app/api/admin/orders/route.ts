import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/lib/services/order.service';

/** Verifies the caller is authenticated and has role = 'admin' */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20')));
  const status = searchParams.get('status') ?? undefined;

  try {
    const { data, total } = await OrderService.getAdminOrders(page, pageSize, status);
    return NextResponse.json({ success: true, data, meta: { page, pageSize, total } });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orderId, status } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }
    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
    }

    await OrderService.updateOrderStatus(orderId, status);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('PATCH /api/admin/orders error:', error);
    if (error instanceof Error && error.message.startsWith('INVALID_STATUS')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
