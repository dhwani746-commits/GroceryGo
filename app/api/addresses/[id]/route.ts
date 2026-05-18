import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { lookupPincodeMetadata, normalizePincodeInput } from '@/lib/services/pincode.service';

function normalizeNickname(value: unknown): string {
  const nickname = typeof value === 'string' ? value.trim() : '';
  return nickname.length > 0 ? nickname.slice(0, 40) : 'Home';
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const id = (await params).id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('addresses').select('*').eq('id', id).eq('user_id', user.id).single();

  if (error) {
    console.error('Get address error:', error);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ address: data });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const id = (await params).id;
  const body = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const normalizedPincode = normalizePincodeInput(String(body.postal_code ?? ''));
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
    console.error('Pincode lookup failed in address update:', error);
    return NextResponse.json({ error: 'Failed to validate pincode' }, { status: 500 });
  }

  const payload = {
    address_line1: typeof body.address_line1 === 'string' ? body.address_line1.trim() : undefined,
    address_line2: body.address_line2 ? String(body.address_line2).trim() : null,
    city: pincodeMeta.city,
    state: pincodeMeta.state,
    postal_code: pincodeMeta.normalizedPincode,
    country: typeof body.country === 'string' ? body.country.trim() : undefined,
    phone: body.phone ? String(body.phone).trim() : null,
    post_office: pincodeMeta.postOffice,
    label: typeof body.label === 'string' ? body.label.trim() : 'Home',
    is_default: Boolean(body.is_default),
  };

  if (!payload.address_line1 || !payload.city || !payload.postal_code || !payload.country) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (payload.phone && !/^\d{10}$/.test(payload.phone)) {
    return NextResponse.json({ error: 'Phone must be 10 digits' }, { status: 400 });
  }

  // Enforce single-default: clear other defaults before setting this one
  if (payload.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const id = (await params).id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
