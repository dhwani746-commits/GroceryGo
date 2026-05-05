// India Post API integration
export interface NormalizedPincodeMetadata {
  normalizedPincode: string;
  city: string;
  state: string;
  district: string;
  postOffice: string;
  stateCode: string | null;
  source: 'india-post-api';
}

export interface IndiaPostResponse {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description: string;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Country: string;
    Pincode: string;
  }> | null;
}

export function normalizePincodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
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

  try {
    // Call India Post API
    const response = await fetch(`https://api.postalpincode.in/pincode/${normalized}`);
    
    if (!response.ok) {
      throw new Error('PINCODE_API_ERROR');
    }

    const dataArray = await response.json();
    
    // Extract the first element from the array (actual response)
    const data = dataArray[0];
    
    // Handle error response
    if (data.Status === 'Error' || !data.PostOffice || data.PostOffice.length === 0) {
      throw new Error('PINCODE_NOT_FOUND');
    }

    // Get the first post office result
    const postOffice = data.PostOffice[0];
    
    return {
      normalizedPincode: normalized,
      city: postOffice.District || postOffice.Name,
      state: postOffice.State,
      district: postOffice.District || postOffice.Name,
      postOffice: postOffice.Name,
      stateCode: deriveStateCode(postOffice.State),
      source: 'india-post-api',
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PINCODE') {
      throw error;
    }
    
    // Handle API errors
    if (error instanceof Error && error.message === 'PINCODE_API_ERROR') {
      throw new Error('Unable to validate pincode at the moment. Please try again later.');
    }
    
    if (error instanceof Error && error.message === 'PINCODE_NOT_FOUND') {
      throw error;
    }
    
    // Generic error handling
    throw new Error('Failed to validate pincode');
  }
}

