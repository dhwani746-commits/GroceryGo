import { createClient } from '@/lib/supabase/server';
import {
  SettingsRepository,
  type StoreSettingsRow,
  type StoreSettingsUpdate,
} from '@/lib/repositories/settings.repository';
import type { AdminProfileInput, ChangePasswordInput, StoreSettingsPatchInput } from '@/lib/validations/settings.schema';

export class SettingsService {
  static async getStoreSettings(): Promise<StoreSettingsRow> {
    return SettingsRepository.getOne();
  }

  static async updateStoreSettings(input: StoreSettingsPatchInput): Promise<StoreSettingsRow> {
    const patch: StoreSettingsUpdate = {};
    if (input.store_name !== undefined) patch.store_name = input.store_name;
    if (input.support_email !== undefined) patch.support_email = input.support_email;
    if (input.support_phone !== undefined) patch.support_phone = input.support_phone;
    if (input.address_line1 !== undefined) patch.address_line1 = input.address_line1;
    if (input.address_line2 !== undefined) patch.address_line2 = input.address_line2;
    if (input.city !== undefined) patch.city = input.city;
    if (input.state !== undefined) patch.state = input.state;
    if (input.pincode !== undefined) patch.pincode = input.pincode;
    if (input.gst_number !== undefined) patch.gst_number = input.gst_number;
    if (input.logo_url !== undefined) patch.logo_url = input.logo_url;

    if (Object.keys(patch).length === 0) {
      throw new Error('NO_FIELDS: No valid fields to update');
    }

    return SettingsRepository.updateOne(patch);
  }

  static async getAdminProfile(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async updateAdminProfile(userId: string, input: AdminProfileInput) {
    const supabase = await createClient();
    const payload: { full_name: string; phone?: string | null } = { full_name: input.full_name };
    if (input.phone !== undefined) {
      payload.phone = input.phone;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('id, full_name, phone, role, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verifies current password via sign-in, then updates password for the session user.
   */
  static async changeAdminPassword(userId: string, email: string, input: ChangePasswordInput) {
    const supabase = await createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: input.currentPassword,
    });

    if (signInError) {
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (updateError) throw updateError;
    if (!updatedUser.user || updatedUser.user.id !== userId) {
      throw new Error('PASSWORD_UPDATE_FAILED');
    }
  }
}
