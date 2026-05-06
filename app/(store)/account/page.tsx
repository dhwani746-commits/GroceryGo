import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountPageClient from './AccountPageClient';

export const metadata = {
  title: 'My Account — Krishna Plastics',
  description: 'Manage your account information and preferences.',
};

async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

async function getUserOrders(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(2);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/account');
  }

  const [profile, orders] = await Promise.all([
    getUserProfile(user.id),
    getUserOrders(user.id)
  ]);

  return <AccountPageClient user={user} profile={profile} orders={orders} />;
}
