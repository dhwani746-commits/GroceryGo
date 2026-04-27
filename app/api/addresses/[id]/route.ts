import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const id = params.id;

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const id = params.id;
  const body = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('addresses')
    .update(body)
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const id = params.id;

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
