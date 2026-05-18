import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';
import { z } from 'zod';

const Schema = z.object({
  razorpay_order_id:   z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature:  z.string().min(1),
});

/**
 * POST /api/razorpay/verify
 *
 * Verifies the HMAC-SHA256 signature returned by the Razorpay Checkout modal.
 *
 * From Razorpay docs:
 *   generated_signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 *   if generated_signature === razorpay_signature → payment is authentic
 *
 * This MUST be called before creating the DB order so we never persist an order
 * for a tampered or replayed payment response.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, secret)
    const payload           = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.warn('Razorpay signature mismatch — possible tampering', {
        userId: user.id,
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Signature is valid — return the payment_id so the client can include it
    // when creating the DB order in the next step.
    return NextResponse.json({
      success:    true,
      paymentId:  razorpay_payment_id,
      rzpOrderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('POST /api/razorpay/verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
