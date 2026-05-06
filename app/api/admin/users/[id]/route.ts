import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
    const supabase = await createClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at')
      .eq('id', id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    // Get auth user data
    let authUser = null;
    try {
      const adminClient = createAdminClient();
      const { data: authData } = await adminClient.auth.admin.listUsers();
      authUser = authData?.users.find(u => u.id === id) || null;
    } catch (err) {
      console.error('Error fetching auth user:', err);
    }

    // Get user addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('id, name, phone, line1, line2, city, state, pincode, is_default')
      .eq('user_id', id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (addressesError) {
      console.error('Error fetching addresses:', addressesError);
    }

    // Get all orders for user with items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        subtotal,
        discount_amount,
        total_amount,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          line_total,
          products ( image_urls )
        )
      `)
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    const userData = {
      id,
      email: authUser?.email || null,
      full_name: profile?.full_name || authUser?.user_metadata?.full_name || null,
      phone: profile?.phone || authUser?.phone || null,
      role: profile?.role || null,
      created_at: authUser?.created_at || profile?.created_at || new Date().toISOString(),
      addresses: addresses || [],
      orders: (orders || []).map(order => ({
        ...order,
        order_items: order.order_items || [],
      })),
    };

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error('GET /api/admin/users/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
