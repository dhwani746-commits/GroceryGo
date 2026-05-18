import { OrderRepository } from '@/lib/repositories/order.repository';
import { createClient } from '@/lib/supabase/server';

const VALID_ORDER_STATUSES = [
  'pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
] as const;

type OrderStatus = typeof VALID_ORDER_STATUSES[number];

interface CreateOrderInput {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    name: string;
    phone: string;
  };
  promoCode?: string;
  idempotencyKey: string;
  paymentMethod: 'razorpay' | 'cod';
  paymentId?: string;
  rzpOrderId?: string;
}

export class OrderService {
  static async getUserOrders(userId: string) {
    if (!userId) throw new Error('User ID is required');
    return OrderRepository.getOrdersByUserId(userId);
  }

  /**
   * Creates an order with server-side price recalculation.
   * Client-sent prices are NEVER trusted — we always fetch from DB.
   * Risk: race condition on stock — acceptable at MVP scale; add SELECT FOR UPDATE post-V1.
   */
  static async createOrder(input: CreateOrderInput) {
    const supabase = await createClient();

    // 1. Fetch authoritative product prices from DB
    const productIds = input.items.map((i) => i.productId);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, is_visible, is_deleted')
      .in('id', productIds)
      .eq('is_visible', true)
      .eq('is_deleted', false);

    if (productError) throw productError;

    // Validate all products exist and are available
    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND: Product ${item.productId} is unavailable`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`STOCK_INSUFFICIENT: Insufficient stock for "${product.name}"`);
      }
    }

    // 2. Recalculate totals server-side (never trust client prices)
    const lineItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);

    // 3. Validate and apply promo code (if provided)
    let discountAmount = 0;
    let promoCodeId: string | undefined;
    let promoTimesUsed: number | null = null;
    let promoUsageLimit: number | null = null;

    if (input.promoCode) {
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('id, discount_type, discount_value, expires_at, usage_limit, times_used, is_active, one_per_user')
        .eq('code', input.promoCode.toUpperCase().trim())
        .single();

      if (promoError || !promo) {
        throw new Error('PROMO_INVALID: Promo code is invalid or expired');
      }
      if (!promo.is_active) {
        throw new Error('PROMO_INACTIVE: Promo code is no longer active');
      }
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        throw new Error('PROMO_EXPIRED: Promo code has expired');
      }
      if (promo.usage_limit !== null && promo.times_used >= promo.usage_limit) {
        throw new Error('PROMO_EXHAUSTED: Promo code usage limit reached');
      }

      // Check one-per-user constraint
      if (promo.one_per_user) {
        const { data: hasUsed } = await supabase
          .rpc('has_user_used_promo_code', {
            p_user_id: input.userId,
            p_promo_code_id: promo.id
          });

        if (hasUsed) {
          throw new Error('PROMO_USED_ONCE: This promo code can only be used once per user');
        }
      }

      if (promo.discount_type === 'percentage') {
        discountAmount = Math.round((subtotal * Number(promo.discount_value)) / 100 * 100) / 100;
      } else {
        discountAmount = Math.min(Number(promo.discount_value), subtotal);
      }

      promoCodeId = promo.id;
      promoTimesUsed = promo.times_used;
      promoUsageLimit = promo.usage_limit;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 4. Create order atomically
    const order = await OrderRepository.createOrder({
      customerId: input.userId,
      items: lineItems.map((li) => ({
        productId: li.productId,
        quantity: li.quantity,
        productName: li.productName,
        unitPrice: li.unitPrice,
        lineTotal: li.lineTotal,
      })),
      deliveryAddress: input.deliveryAddress,
      subtotal,
      discountAmount,
      totalAmount,
      promoCodeId,
      idempotencyKey: input.idempotencyKey,
      paymentMethod:  input.paymentMethod,
      paymentId:      input.paymentId,
      rzpOrderId:     input.rzpOrderId,
    });

    // 5. Record promo code usage (non-blocking; failure doesn't abort order)
    if (promoCodeId) {
      try {
        // Record usage in promo_code_usage table using the database function
        const { error: usageError } = await supabase.rpc('record_promo_code_usage', {
          p_promo_code_id: promoCodeId,
          p_user_id: input.userId,
          p_order_id: order.id,
          p_discount_amount: discountAmount
        });

        if (usageError) {
          console.error('Failed to record promo code usage:', {
            promoCodeId,
            userId: input.userId,
            orderId: order.id,
            discountAmount,
            error: usageError,
          });
        }
      } catch (error) {
        console.error('Exception recording promo code usage:', error);
      }
    }

    return order;
  }

  static async updateOrderStatus(orderId: string, status: string) {
    if (!VALID_ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new Error(`INVALID_STATUS: "${status}" is not a valid order status`);
    }
    return OrderRepository.updateOrderStatus(orderId, status);
  }

  static async getAdminOrders(page: number, pageSize: number, status?: string) {
    return OrderRepository.getAllOrders(page, pageSize, status);
  }

  static async getDashboardStats() {
    return OrderRepository.getDashboardStats();
  }

  static async getTopProducts(limit: number) {
    return OrderRepository.getTopProducts(limit);
  }

  static async getRecentPendingOrders(limit: number) {
    return OrderRepository.getRecentPendingOrders(limit);
  }
}
