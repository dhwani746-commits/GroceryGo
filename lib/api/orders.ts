import { Order } from '@/lib/repositories/order.repository';

export async function fetchUserOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) {
    if (res.status === 401) {
      return [];
    }
    throw new Error('Failed to fetch orders');
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch orders');
  }
  return json.data;
}
