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
      subject: 'Krishna Plastics - Verify Your Email',
      html: `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email – Krishna Plastics</title>

  <style>
    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 12px !important;
      }

      .card {
        border-radius: 12px !important;
      }

      .content {
        padding: 28px 20px 22px !important;
      }

      .header {
        padding: 24px 20px 22px !important;
      }

      .footer {
        padding: 20px !important;
      }

      .divider-pad {
        padding: 0 20px !important;
      }

      .brand-box {
        width: 170px !important;
        height: 34px !important;
      }

      .title {
        font-size: 20px !important;
        line-height: 1.3 !important;
      }

      .body-text {
        font-size: 14px !important;
        line-height: 1.6 !important;
      }

      .otp-wrap {
        margin-bottom: 14px !important;
      }

      .otp-cell {
        padding: 0 3px !important;
      }

      .otp-digit {
        width: 42px !important;
        height: 50px !important;
        line-height: 50px !important;
        font-size: 24px !important;
        border-radius: 8px !important;
      }

      .expiry {
        padding: 4px 12px !important;
      }

      .security {
        font-size: 12px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#F2F2F2; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="wrapper" style="background-color:#F2F2F2; padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card" style="max-width:560px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #E3E3E3;">

          <!-- Header -->
          <tr>
            <td class="header" style="background-color:#0D2F5C; padding:32px 36px 28px; text-align:center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 8px;">
                <tr>
                  <td class="brand-box" width="200" height="36" style="background-color:#F07B00; border-radius:8px; text-align:center;">
                    <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.3px; line-height:36px; display:block;">
                      Krishna Plastics
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:11px; color:#B3D4F7; letter-spacing:1.5px; text-transform:uppercase; font-weight:500;">
                Secure Verification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content" style="padding:36px 36px 28px;">

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px; text-align:center; width:100%;">
                <tr>
                  <td>
                    <h1 class="title" style="margin:0 0 10px; font-size:22px; font-weight:700; color:#0D2F5C;">
                      Verify your email address
                    </h1>

                    <p class="body-text" style="margin:0; font-size:15px; color:#717171; line-height:1.65;">
                      Thanks for signing up with
                      <strong style="color:#1A1A1A;">Krishna Plastics</strong>!
                      Use the code below to complete your registration.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; background-color:#EBF4FF; border:1.5px solid #B3D4F7; border-radius:12px; margin-bottom:20px;">
                <tr>
                  <td style="padding:28px 16px; text-align:center;">

                    <p style="margin:0 0 16px; font-size:11px; font-weight:600; color:#1A5EA8; letter-spacing:1.5px; text-transform:uppercase;">
                      Your verification code
                    </p>

                    <table cellpadding="0" cellspacing="0" role="presentation" class="otp-wrap" style="margin:0 auto 18px;">
                      <tr>
                        <td class="otp-cell" style="padding:0 5px;">
                          <div class="otp-digit" style="width:52px; height:60px; background-color:#ffffff; border:2px solid #2172C7; border-radius:10px; font-size:32px; font-weight:700; color:#0D2F5C; line-height:60px; text-align:center;">${otp[0]}</div>
                        </td>
                        <td class="otp-cell" style="padding:0 5px;">
                          <div class="otp-digit" style="width:52px; height:60px; background-color:#ffffff; border:2px solid #2172C7; border-radius:10px; font-size:32px; font-weight:700; color:#0D2F5C; line-height:60px; text-align:center;">${otp[1]}</div>
                        </td>
                        <td class="otp-cell" style="padding:0 5px;">
                          <div class="otp-digit" style="width:52px; height:60px; background-color:#ffffff; border:2px solid #2172C7; border-radius:10px; font-size:32px; font-weight:700; color:#0D2F5C; line-height:60px; text-align:center;"> ${otp[2]} </div>
                        </td>
                        <td class="otp-cell" style="padding:0 5px;">
                          <div class="otp-digit" style="width:52px; height:60px; background-color:#ffffff; border:2px solid #2172C7; border-radius:10px; font-size:32px; font-weight:700; color:#0D2F5C; line-height:60px; text-align:center;"> ${otp[3]}</div>
                        </td>
                      </tr>
                    </table>

                    <div class="expiry" style="display:inline-block; background-color:#FFF4E6; border:1px solid #FFD5A0; border-radius:20px; padding:5px 14px;">
                      <span style="font-size:12px; color:#B85A00; font-weight:600;">
                        ⏱ Expires in 5 minutes
                      </span>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Security note -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; background-color:#F2F2F2; border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p class="security" style="margin:0; font-size:13px; color:#717171; line-height:1.6;">
                      🔒 <strong style="color:#3D3D3D;">Never share this code.</strong>
                      Krishna Plastics will never ask for your OTP via phone, email, or chat.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="divider-pad" style="padding:0 36px;">
              <div style="height:1px; background-color:#E3E3E3;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="padding:24px 36px; text-align:center;">
              <p style="margin:0 0 6px; font-size:12px; color:#9E9E9E; line-height:1.6;">
                Didn't create an account? You can safely ignore this email.
              </p>

              <p style="margin:0; font-size:12px; color:#C8C8C8;">
                © 2026 Krishna Plastics. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
