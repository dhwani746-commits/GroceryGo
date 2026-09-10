import { useQuery } from '@tanstack/react-query';

export interface StoreSettings {
  id: string;
  store_name: string;
  support_email: string | null;
  support_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_number: string | null;
  logo_url: string | null;
}

async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) {
    throw new Error('Failed to fetch store settings');
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Failed to fetch store settings');
  }
  return json.data;
}

export function useStoreSettings() {
  const { data, isLoading, isError } = useQuery<StoreSettings>({
    queryKey: ['storeSettings'],
    queryFn: fetchStoreSettings,
    staleTime: 60 * 60 * 1000, // 1 hour caching since settings change rarely
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
    refetchOnWindowFocus: false,
  });

  return {
    settings: data ?? null,
    loading: isLoading,
    error: isError,
    storeName: data?.store_name || 'GroceryGo',
    supportEmail: data?.support_email || 'support@grocerygo.in',
    supportPhone: data?.support_phone || '+91 99999 99999',
    address: data
      ? `${data.address_line1 || ''} ${data.address_line2 || ''}, ${data.city || ''}, ${data.state || ''} ${data.pincode || ''}`.trim()
      : 'Mumbai, Maharashtra, India',
  };
}
