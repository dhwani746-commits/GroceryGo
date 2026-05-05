import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/lib/services/user.service';

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  return await UserService.getProfile(user.id);
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === 'ADMIN';
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
