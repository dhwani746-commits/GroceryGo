import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SettingsService } from '@/lib/services/settings.service';
import { StoreSettingsPatchSchema } from '@/lib/validations/settings.schema';

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
    const data = await SettingsService.getStoreSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/admin/settings/store error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load store settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = StoreSettingsPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const definedKeys = Object.keys(parsed.data).filter(
      (k) => parsed.data[k as keyof typeof parsed.data] !== undefined,
    );
    if (definedKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one field is required for update' },
        { status: 400 },
      );
    }

    const data = await SettingsService.updateStoreSettings(parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('PATCH /api/admin/settings/store error:', error);
    if (error instanceof Error && error.message.startsWith('NO_FIELDS')) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update store settings' }, { status: 500 });
  }
}
