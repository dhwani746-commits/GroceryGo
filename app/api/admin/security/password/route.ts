import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SettingsService } from '@/lib/services/settings.service';
import { ChangePasswordSchema } from '@/lib/validations/settings.schema';

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

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const email = ctx.user.email;
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email login is required to change password' },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await SettingsService.changeAdminPassword(ctx.user.id, email, parsed.data);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('POST /api/admin/security/password error:', error);
    if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message === 'PASSWORD_UPDATE_FAILED') {
      return NextResponse.json({ success: false, error: 'Password update failed' }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}
