import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/lib/services/order.service';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'Order must have at least one item'),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    name: z.string().min(1),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  }),
  promoCode: z.string().optional(),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
  /** Payment method chosen by the customer */
  paymentMethod: z.enum(['razorpay', 'cod']),
  /** Razorpay payment_id — required when paymentMethod is 'razorpay' */
  paymentId: z.string().optional(),
  /** Razorpay order_id — required when paymentMethod is 'razorpay' */
  rzpOrderId: z.string().optional(),
}).refine(
  (data) => data.paymentMethod === 'cod' || (!!data.paymentId && !!data.rzpOrderId),
  { message: 'paymentId and rzpOrderId are required for Razorpay payments', path: ['paymentId'] },
);

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await OrderService.getUserOrders(user.id);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const order = await OrderService.createOrder({
      userId: user.id,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/orders error:', error);

    if (error instanceof Error) {
      // Surface idempotency conflicts and validation errors to the client
      if (
        error.message.includes('duplicate') ||
        error.message.includes('idempotency') ||
        error.message.includes('PROMO_') ||
        error.message.includes('PRODUCT_') ||
        error.message.includes('STOCK_')
      ) {
        return NextResponse.json({ success: false, error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
