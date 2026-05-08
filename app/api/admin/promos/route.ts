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

const PromoSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.number().positive(),
  expires_at: OptionalDateTimeSchema.optional(),
  usage_limit: z.number().int().positive().optional().nullable(),
  one_per_user: z.boolean().default(false),
  is_active: z.boolean().default(true),
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

export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/admin/promos error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch promos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    // Normalize code to uppercase before validation
    if (body.code) body.code = String(body.code).toUpperCase().trim();
    if (Object.hasOwn(body, 'expires_at')) {
      body.expires_at = body.expires_at === '' ? null : body.expires_at;
    }

    const parsed = PromoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('promo_codes')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Promo code already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/promos error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create promo' }, { status: 500 });
  }
}
