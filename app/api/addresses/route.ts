import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { lookupPincodeMetadata, normalizePincodeInput } from '@/lib/services/pincode.service';

function normalizeNickname(value: unknown): string {
  const nickname = typeof value === 'string' ? value.trim() : '';
  return nickname.length > 0 ? nickname.slice(0, 40) : 'Home';
}

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
    full_name,
    landmark,
    address_line1,
    address_line2,
    postal_code,
    country,
    phone,
    is_default,
    nickname,
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
    console.error('Pincode lookup failed in address create:', error);
    return NextResponse.json({ error: 'Failed to validate pincode' }, { status: 500 });
  }

  const { data, error } = await supabase.from('addresses').insert([
    {
      user_id: user.id,
      full_name: typeof full_name === 'string' ? full_name.trim() || null : null,
      landmark: typeof landmark === 'string' ? landmark.trim() || null : null,
      address_line1: String(address_line1).trim(),
      address_line2: address_line2 ?? null,
      city: pincodeMeta.city,
      state: pincodeMeta.state,
      district: pincodeMeta.district,
      post_office: pincodeMeta.postOffice,
      state_code: pincodeMeta.stateCode,
      normalized_pincode: pincodeMeta.normalizedPincode,
      pincode_source: pincodeMeta.source,
      pincode_validated_at: new Date().toISOString(),
      postal_code: pincodeMeta.normalizedPincode,
      country: String(country).trim(),
      phone: phone ?? null,
      nickname: normalizeNickname(nickname),
      is_default: !!is_default,
    },
  ]).select().single();

  if (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}
