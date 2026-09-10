import { createAdminClient } from '@/lib/supabase/admin';

const STORE_SETTINGS_COLUMNS =
  'id, singleton, store_name, support_email, support_phone, address_line1, address_line2, city, state, pincode, gst_number, logo_url, created_at, updated_at';

export interface StoreSettingsRow {
  id: string;
  singleton: boolean;
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
  created_at: string;
  updated_at: string;
}

export type StoreSettingsUpdate = Partial<
  Pick<
    StoreSettingsRow,
    | 'store_name'
    | 'support_email'
    | 'support_phone'
    | 'address_line1'
    | 'address_line2'
    | 'city'
    | 'state'
    | 'pincode'
    | 'gst_number'
    | 'logo_url'
  >
>;

export class SettingsRepository {
  /**
   * Returns the singleton store settings row, inserting a default row if missing.
   */
  static async getOne(): Promise<StoreSettingsRow> {
    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from('store_settings')
      .select(STORE_SETTINGS_COLUMNS)
      .eq('singleton', true)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existing) {
      const row = existing as StoreSettingsRow;
      if (row.store_name?.toLowerCase().includes('krishna') || row.store_name?.toLowerCase().includes('plastic')) {
        return await SettingsRepository.updateOne({ store_name: 'GroceryGo' });
      }
      return row;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('store_settings')
      .insert({ singleton: true, store_name: 'GroceryGo' })
      .select(STORE_SETTINGS_COLUMNS)
      .single();

    if (insertError) throw insertError;
    return inserted as StoreSettingsRow;
  }

  /** Partial update of the singleton row */
  static async updateOne(patch: StoreSettingsUpdate): Promise<StoreSettingsRow> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('store_settings')
      .update(patch)
      .eq('singleton', true)
      .select(STORE_SETTINGS_COLUMNS)
      .single();

    if (error) throw error;
    return data as StoreSettingsRow;
  }
}
