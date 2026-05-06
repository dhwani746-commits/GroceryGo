import { NextResponse } from 'next/server';
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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Use admin client to fetch ALL auth users
    const adminClient = createAdminClient();
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ success: false, error: 'Failed to fetch auth users' }, { status: 500 });
    }

    // Get all profiles to merge with auth users
    const supabase = await createClient();
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create a map of profiles by user ID
    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    // Get recent orders for all users (last 2 orders per user)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_id, status, total_amount, created_at')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Group orders by customer_id
    const ordersByUser = new Map();
    orders?.forEach(order => {
      if (!ordersByUser.has(order.customer_id)) {
        ordersByUser.set(order.customer_id, []);
      }
      if (ordersByUser.get(order.customer_id).length < 2) {
        ordersByUser.get(order.customer_id).push(order);
      }
    });

    // Merge auth users with profile data and recent orders
    const users = authUsers.users.map(authUser => {
      const profile = profileMap.get(authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
        phone: profile?.phone || authUser.phone || null,
        role: profile?.role || null,
        created_at: authUser.created_at,
        updated_at: profile?.updated_at || authUser.updated_at,
        recent_orders: ordersByUser.get(authUser.id) || [],
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
