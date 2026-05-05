import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from('contacts').insert([
      {
        name,
        email,
        message,
      },
    ]);

    if (error) {
      console.error('Insert contact error:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, contact: data?.[0] });
  } catch (err) {
    console.error('Contact POST error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
