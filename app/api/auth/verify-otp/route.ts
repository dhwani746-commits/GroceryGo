import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStoredOTP, markOTPVerified } from '../send-otp/route';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Validate OTP format
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    // Get stored OTP from database
    const storedData = await getStoredOTP(email);
    
    if (!storedData) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Mark OTP as verified after successful verification
    const markedVerified = await markOTPVerified(email);
    
    if (!markedVerified) {
      console.error('Failed to mark OTP as verified');
      return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }

    // Update user's email verification status in Supabase
    const supabase = createAdminClient();
    
    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user's email confirmation
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Error confirming email:', updateError);
      return NextResponse.json({ error: 'Failed to confirm email' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Email verified successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
