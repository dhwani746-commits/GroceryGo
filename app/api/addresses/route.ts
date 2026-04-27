import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }

  return NextResponse.json({ addresses: data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address_line1, address_line2, city, state, postal_code, country, phone, is_default } = body;

  if (!address_line1 || !city || !postal_code || !country) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase.from('addresses').insert([
    {
      user_id: user.id,
      address_line1,
      address_line2: address_line2 ?? null,
      city,
      state: state ?? null,
      postal_code,
      country,
      phone: phone ?? null,
      is_default: !!is_default,
    },
  ]);

  if (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }

  return NextResponse.json({ address: data?.[0] });
}
