import { getIndiaPincode, isValidPincode } from 'india-pincode';

export interface NormalizedPincodeMetadata {
  normalizedPincode: string;
  city: string;
  state: string;
  district: string;
  postOffice: string;
  stateCode: string | null;
  source: 'india-pincode';
}

type PincodeClient = ReturnType<typeof getIndiaPincode>;
let pincodeClientPromise: Promise<PincodeClient> | null = null;

async function getPincodeClient(): Promise<PincodeClient> {
  if (pincodeClientPromise) return pincodeClientPromise;

  pincodeClientPromise = (async () => {
    try {
      return getIndiaPincode();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('data file not found')) {
        throw error;
      }
      const browserModule = await import('india-pincode/browser');
      return await browserModule.getIndiaPincode();
    }
  })();

  return pincodeClientPromise;
}

export function normalizePincodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

function deriveStateCode(state: string): string | null {
  const trimmed = state.trim();
  if (!trimmed) return null;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase() || null;
  }
  return words
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export async function lookupPincodeMetadata(rawPincode: string): Promise<NormalizedPincodeMetadata> {
  const normalized = normalizePincodeInput(rawPincode);
  if (!isValidPincode(normalized)) {
    throw new Error('INVALID_PINCODE');
  }

  const pincodeClient = await getPincodeClient();
  const result = pincodeClient.getByPincode(normalized, { limit: 10, page: 1, deliveryOnly: true });
  if (!result.success || !result.data || result.data.data.length === 0) {
    throw new Error('PINCODE_NOT_FOUND');
  }

  const primary = result.data.data[0];
  return {
    normalizedPincode: normalized,
    city: primary.district,
    state: primary.state,
    district: primary.district,
    postOffice: primary.area,
    stateCode: deriveStateCode(primary.state),
    source: 'india-pincode',
  };
}

