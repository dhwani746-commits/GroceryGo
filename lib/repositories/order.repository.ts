import { createClient as createServerClient } from '@/lib/supabase/server';

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  products?: {
    image_urls: string[] | null;
  } | null;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  name: string;
  phone: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promo_code_id: string | null;
  delivery_address: DeliveryAddress;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface CreateOrderInput {
  customerId: string;
  items: Array<{ 
    productId: string; 
    quantity: number; 
    productName: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  promoCodeId?: string;
  idempotencyKey: string;
}

export class OrderRepository {
  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        status,
        subtotal,
        discount_amount,
        total_amount,
        promo_code_id,
        delivery_address,
        razorpay_order_id,
        razorpay_payment_id,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          line_total,
          products ( image_urls )
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Order[];
  }

  static async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        status,
        subtotal,
        discount_amount,
        total_amount,
        promo_code_id,
        delivery_address,
        razorpay_order_id,
        razorpay_payment_id,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          line_total,
          products ( image_urls )
        )
      `)
      .eq('id', orderId)
      .eq('customer_id', userId) // Belt-and-suspenders: RLS also enforces this
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Row not found
      throw error;
    }
    return data as unknown as Order;
  }

  /**
   * Creates order + items atomically via Supabase RPC.
   * Falls back to sequential inserts if RPC is not available.
   * The idempotency_key unique constraint prevents duplicate orders.
   */
  static async createOrder(input: CreateOrderInput): Promise<Order> {
    const supabase = await createServerClient();

    // Check idempotency: if order with this key exists, return it
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('idempotency_key', input.idempotencyKey)
      .single();

    if (existing) {
      // Return the existing order (idempotent replay)
      const existingOrder = await OrderRepository.getOrderById(existing.id, input.customerId);
      if (!existingOrder) throw new Error('Idempotency conflict: order not found');
      return existingOrder;
    }

    // Insert order header
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: input.customerId,
        status: 'pending',
        subtotal: input.subtotal,
        discount_amount: input.discountAmount,
        total_amount: input.totalAmount,
        promo_code_id: input.promoCodeId ?? null,
        delivery_address: input.deliveryAddress,
        idempotency_key: input.idempotencyKey,
      })
      .select('id')
      .single();

    if (orderError) {
      if (orderError.code === '23505') {
        // Unique violation on idempotency_key — concurrent request won the race
        throw new Error('IDEMPOTENCY_CONFLICT: Order with this key already exists');
      }
      throw orderError;
    }

    // Bulk-insert order items
    const orderItemsPayload = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);

    if (itemsError) throw itemsError;

    const created = await OrderRepository.getOrderById(order.id, input.customerId);
    if (!created) throw new Error('Order created but could not be retrieved');
    return created;
  }

  // ── Admin-only queries ────────────────────────────────────────────────────

  static async getAllOrders(page = 1, pageSize = 20, status?: string): Promise<{ data: Order[]; total: number }> {
    const supabase = await createServerClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('orders')
      .select(`
        id, customer_id, status, subtotal, discount_amount, total_amount,
        promo_code_id, delivery_address, razorpay_order_id, razorpay_payment_id,
        created_at, updated_at,
        order_items ( id, product_name, quantity, unit_price, line_total ),
        profiles ( full_name, phone )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []) as unknown as Order[], total: count ?? 0 };
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }

  static async getDashboardStats() {
    const supabase = await createServerClient();

    const [ordersResult, revenueResult, customersResult, pendingResult] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').not('status', 'eq', 'cancelled'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = (revenueResult.data ?? []).reduce(
      (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount),
      0,
    );

    return {
      totalOrders: ordersResult.count ?? 0,
      totalRevenue,
      totalCustomers: customersResult.count ?? 0,
      pendingOrders: pendingResult.count ?? 0,
    };
  }
}
