import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderRepository } from '@/lib/repositories/order.repository';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const order = await OrderRepository.getOrderByIdForAdmin(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Fetch promo code if exists
    let promoCode = null;
    if (order.promo_code_id) {
      const supabase = await createClient();
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('code')
        .eq('id', order.promo_code_id)
        .single();
      if (promo) {
        promoCode = promo.code;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        promo_code: promoCode,
        profiles: order.profiles || {
          full_name: order.delivery_address.name,
          phone: order.delivery_address.phone,
          email: null,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/orders/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
