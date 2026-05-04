import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const OptionalDateTimeSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsedDate = new Date(trimmed);
    if (Number.isNaN(parsedDate.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid expires_at datetime' });
      return z.NEVER;
    }

    return parsedDate.toISOString();
  });

const UpdatePromoSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric').optional(),
  discount_type: z.enum(['percentage', 'flat']).optional(),
  is_active: z.boolean().optional(),
  expires_at: OptionalDateTimeSchema.optional(),
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

  return profile?.role === 'admin' ? { user } : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const rawBody = await req.json();
    const body =
      rawBody && typeof rawBody === 'object'
        ? {
            ...rawBody,
            ...(rawBody.code ? { code: String(rawBody.code).toUpperCase().trim() } : {}),
            ...(Object.hasOwn(rawBody, 'expires_at')
              ? { expires_at: rawBody.expires_at === '' ? null : rawBody.expires_at }
              : {}),
          }
        : rawBody;
    const parsed = UpdatePromoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one field is required for update' },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
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
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
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
