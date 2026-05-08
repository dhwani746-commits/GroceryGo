import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ValidatePromoSchema = z.object({
  code: z.string().min(1).max(32),
  cart_total: z.number().positive(),
});

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ValidatePromoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, cart_total } = parsed.data;
    const supabase = await createClient();

    // Get promo code details
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ success: false, error: 'Invalid promo code' }, { status: 404 });
    }

    // Check if promo is active
    if (!promo.is_active) {
      return NextResponse.json({ success: false, error: 'Promo code is inactive' }, { status: 400 });
    }

    // Check if promo has expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Promo code has expired' }, { status: 400 });
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.times_used >= promo.usage_limit) {
      return NextResponse.json({ success: false, error: 'Promo code usage limit reached' }, { status: 400 });
    }

    // Check one-per-user constraint
    if (promo.one_per_user) {
      const { data: hasUsed } = await supabase
        .rpc('has_user_used_promo_code', {
          p_user_id: user.id,
          p_promo_code_id: promo.id
        });

      if (hasUsed) {
        return NextResponse.json({ 
          success: false, 
          error: 'This promo code can only be used once per user' 
        }, { status: 400 });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = Number((cart_total * promo.discount_value / 100).toFixed(2));
    } else {
      discountAmount = Math.min(promo.discount_value, cart_total);
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cart_total);

    const finalTotal = cart_total - discountAmount;

    return NextResponse.json({
      success: true,
      data: {
        promo_code_id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        cart_total: cart_total,
        final_total: finalTotal,
        message: `Promo code applied! You saved ${discountAmount.toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('POST /api/promos/validate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
