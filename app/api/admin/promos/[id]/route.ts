import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdatePromoSchema = z.object({
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  discount_value: z.number().positive().optional(),
});

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

  return profile?.role === 'admin' ? { user, supabase } : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdatePromoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { data, error } = await ctx.supabase
      .from('promo_codes')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`PATCH /api/admin/promos/${id} error:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update promo' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    // Soft-delete by deactivating rather than hard-deleting (preserves order history)
    const { error } = await ctx.supabase
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/admin/promos/${id} error:`, error);
    return NextResponse.json({ success: false, error: 'Failed to deactivate promo' }, { status: 500 });
  }
}
