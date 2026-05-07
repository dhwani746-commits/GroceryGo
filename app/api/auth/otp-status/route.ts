import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get the latest unverified OTP for this email
    const { data: otpData, error } = await supabase
      .from('otp_verifications')
      .select('created_at, expires_at')
      .eq('email', email)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active OTP found
        return NextResponse.json({ 
          hasActiveOTP: false,
          timeLeft: 0,
          canResend: true
        });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    const timeLeftSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));

    return NextResponse.json({
      hasActiveOTP: true,
      createdAt: otpData.created_at,
      expiresAt: otpData.expires_at,
      timeLeft: timeLeftSeconds,
      canResend: timeLeftSeconds === 0
    });

  } catch (error) {
    console.error('OTP status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
