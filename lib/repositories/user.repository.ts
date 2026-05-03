import { createClient as createServerClient } from '@/lib/supabase/server';

export class UserRepository {
  static async getProfileById(userId: string) {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    if (data) {
      data.role = data.role.toUpperCase();
    }
    return data;
  }
}
