import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/lib/services/order.service';

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

  return profile?.role === 'admin' ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const stats = await OrderService.getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/admin/dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
