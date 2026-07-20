import { NextResponse } from 'next/server';
import { SettingsRepository } from '@/lib/repositories/settings.repository';

export async function GET() {
  try {
    const settings = await SettingsRepository.getOne();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
