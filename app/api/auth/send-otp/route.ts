import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check rate limiting using database
    const { data: existingOtp, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('attempts, expires_at, created_at')
      .eq('email', email)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingOtp && existingOtp.attempts >= 3) {
      return NextResponse.json({ error: 'Too many OTP requests. Please try again later.' }, { status: 429 });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Store OTP in database (upsert to handle existing records)
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .upsert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        attempts: (existingOtp?.attempts || 0) + 1,
        is_verified: false
      }, {
        onConflict: 'email'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
    }

    // Send OTP email using Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Verify Your Email - Krishna Plastics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Verify Your Email Address</h1>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Thank you for signing up with Krishna Plastics! To complete your registration, please use the following 4-digit verification code:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 8px;">${otp}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              This code will expire in 5 minutes for security reasons.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                If you didn't request this verification, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      createdAt: existingOtp?.created_at || expiresAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      // Include OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get stored OTP from database
export async function getStoredOTP(email: string): Promise<{ otp: string; expires_at: string } | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('otp_verifications')
    .select('otp, expires_at')
    .eq('email', email)
    .eq('is_verified', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    console.error('Database error:', error);
    return null;
  }

  return data;
}

// Helper function to mark OTP as verified
export async function markOTPVerified(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('otp_verifications')
    .update({ is_verified: true })
    .eq('email', email)
    .eq('is_verified', false);

  return !error;
}
