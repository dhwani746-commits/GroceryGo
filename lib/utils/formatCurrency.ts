/**
 * Format a number as Indian currency
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}
