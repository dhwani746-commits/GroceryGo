import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SettingsService } from '@/lib/services/settings.service';
import { AdminProfileSchema } from '@/lib/validations/settings.schema';

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
  if (!ctx) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const profile = await SettingsService.getAdminProfile(ctx.user.id);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('GET /api/admin/profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = AdminProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await SettingsService.updateAdminProfile(ctx.user.id, parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PATCH /api/admin/profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
