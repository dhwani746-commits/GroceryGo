/**
 * Discount utility functions
 * Handles discount calculations and badge generation
 */

export interface ProductDiscountData {
  original_price?: number | null;
  discount_percentage?: number | null;
  price: number;
}

/**
 * Calculates discount based on database values
 * Uses original_price and discount_percentage from product record
 * Returns null if no discount is set
 */
export function getProductDiscount(
  product: ProductDiscountData
): {
  originalPrice: number;
  discountPercent: number;
  savingsInCents: number;
} | null {
  const priceInCents = Math.round(product.price * 100);

  // If we have an original price that's higher than the selling price, show discount
  if (product.original_price && product.original_price > product.price) {
    const originalPriceInCents = Math.round(product.original_price * 100);
    const savingsInCents = originalPriceInCents - priceInCents;
    const discountPercent = product.discount_percentage ??
      Math.round((savingsInCents / originalPriceInCents) * 100);

    return {
      originalPrice: originalPriceInCents,
      discountPercent,
      savingsInCents,
    };
  }

  return null;
}

/**
 * Formats price in rupees (assumes input is in paise/cents)
 */
export function formatPriceInRupees(priceInCents: number): string {
  const rupees = priceInCents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Calculates effective price after discount
 */
export function getEffectivePrice(priceInCents: number, discountPercent?: number): number {
  if (!discountPercent) return priceInCents;
  return Math.round(priceInCents * (100 - discountPercent) / 100);
}
