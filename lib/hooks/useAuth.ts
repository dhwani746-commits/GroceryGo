import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name?: string;
  full_name?: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User | null;
  profile: Profile | null;
}

async function fetchAuth(): Promise<AuthResponse> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    if (res.status === 401 || res.status === 404) {
      return { user: null, profile: null };
    }
    throw new Error('Failed to fetch auth state');
  }
  return res.json();
}

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchAuth,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    loading: isLoading,
    isAdmin: data?.profile?.role === 'ADMIN',
  };
}
