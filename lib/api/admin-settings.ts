export interface AdminProfileDto {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface StoreSettingsDto {
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

export async function getAdminProfile(): Promise<AdminProfileDto> {
  const res = await fetch('/api/admin/profile');
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to load profile');
  return json.data;
}

export async function patchAdminProfile(body: {
  full_name: string;
  phone?: string | null;
}): Promise<AdminProfileDto> {
  const res = await fetch('/api/admin/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to update profile');
  return json.data;
}

export async function postChangePassword(body: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const res = await fetch('/api/admin/security/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to change password');
}

export async function getStoreSettings(): Promise<StoreSettingsDto> {
  const res = await fetch('/api/admin/settings/store');
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to load store settings');
  return json.data;
}

export async function patchStoreSettings(
  body: Partial<
    Pick<
      StoreSettingsDto,
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
  >,
): Promise<StoreSettingsDto> {
  const res = await fetch('/api/admin/settings/store', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to update store settings');
  return json.data;
}
