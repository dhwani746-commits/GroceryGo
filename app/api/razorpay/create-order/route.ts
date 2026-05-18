import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import razorpay from '@/lib/razorpay';
import { z } from 'zod';

const Schema = z.object({
  /** Order total in paise (₹1 = 100 paise) — re-derived server-side from cart items in production */
  amountInPaise: z.number().int().positive(),
  /** Human-readable receipt ID — used for Razorpay order notes */
  receipt: z.string().max(40).optional(),
});

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order and returns the order_id + key_id to the client.
 * The client uses these to open the Razorpay Checkout modal.
 *
 * Security notes:
 * - Auth is required — anonymous users cannot initiate payment.
 * - Amount comes from client here for simplicity, but in a hardened setup it
 *   should be re-computed server-side from the cart items before passing to Razorpay.
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
        { success: false, error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { amountInPaise, receipt } = parsed.data;

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  receipt ?? `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      success:  true,
      orderId:  rzpOrder.id,          // e.g. "order_XXXXXXXXXX"
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim(),
    });
  } catch (error) {
    console.error('POST /api/razorpay/create-order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
