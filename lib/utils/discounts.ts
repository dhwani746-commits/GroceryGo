/**
 * Discount utility functions
 * Handles discount calculations and badge generation
 */

/**
 * Calculates if a product should have a discount based on its ID and price
 * Uses a deterministic algorithm so the same product always gets the same discount
 * Returns null if no discount
 */
export function getProductDiscount(productId: string, priceInCents: number): {
  originalPrice: number;
  discountPercent: number;
  savingsInCents: number;
} | null {
  // Use hash of product ID to determine if discounted (20% of products)
  // This is deterministic so same product always has same discount
  const hashCode = Array.from(productId).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const hasDiscount = Math.abs(hashCode) % 5 === 0; // 20% of products
  if (!hasDiscount) return null;

  // Discount between 15-30%
  const discountPercent = 15 + (Math.abs(hashCode) % 16);
  const savingsInCents = Math.round(priceInCents * discountPercent / 100);
  const originalPrice = priceInCents + savingsInCents;

  return {
    originalPrice,
    discountPercent,
    savingsInCents,
  };
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
