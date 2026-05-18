import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { lookupPincodeMetadata, normalizePincodeInput } from '@/lib/services/pincode.service';


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

  const {
    address_line1,
    address_line2,
    postal_code,
    country,
    phone,
    is_default,
    label,
  } = body;

  if (!address_line1 || !postal_code || !country) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (phone && !/^\d{10}$/.test(String(phone))) {
    return NextResponse.json({ error: 'Phone must be 10 digits' }, { status: 400 });
  }
  const normalizedPincode = normalizePincodeInput(String(postal_code));
  if (!/^\d{6}$/.test(normalizedPincode)) {
    return NextResponse.json({ error: 'Postal code must be 6 digits' }, { status: 400 });
  }

  let pincodeMeta;
  try {
    pincodeMeta = await lookupPincodeMetadata(normalizedPincode);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PINCODE') {
      return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'PINCODE_NOT_FOUND') {
      return NextResponse.json({ error: 'Pincode not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'Failed to connect to India Post API') {
      return NextResponse.json({ error: 'India Post API is temporarily unavailable' }, { status: 503 });
    }
    if (error instanceof Error && error.message === 'Failed to validate pincode') {
      return NextResponse.json({ error: 'Failed to validate pincode' }, { status: 500 });
    }
    console.error('Pincode lookup failed in address create:', error);
    return NextResponse.json({ error: 'Failed to validate pincode' }, { status: 500 });
  }

  // Enforce single-default: clear other defaults before creating this one
  if (!!is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase.from('addresses').insert([
    {
      user_id: user.id,
      address_line1: String(address_line1).trim(),
      address_line2: address_line2 ? String(address_line2).trim() : null,
      city: pincodeMeta.city,
      state: pincodeMeta.state,
      postal_code: pincodeMeta.normalizedPincode,
      country: String(country).trim(),
      phone: phone ? String(phone).trim() : null,
      post_office: pincodeMeta.postOffice,
      is_default: !!is_default,
      label: typeof label === 'string' ? label.trim() : 'Home',
    },
  ]).select().single();

  if (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}
