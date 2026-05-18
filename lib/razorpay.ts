import Razorpay from 'razorpay';

/**
 * Singleton Razorpay server-side instance.
 * Only imported in API routes — never bundled client-side.
 * Key secret is never prefixed NEXT_PUBLIC_ so it cannot leak to the browser.
 */
function createRazorpayInstance() {
  const keyId     = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay env vars missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local',
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Module-level singleton — reused across hot-reloads in dev
const razorpay = createRazorpayInstance();
export default razorpay;
