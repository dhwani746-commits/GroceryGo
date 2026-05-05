'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings, User, Lock, Store, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminProfile,
  getStoreSettings,
  patchAdminProfile,
  patchStoreSettings,
  postChangePassword,
} from '@/lib/api/admin-settings';

type SettingsTab = 'profile' | 'security' | 'store';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [pageLoading, setPageLoading] = useState(true);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [storeForm, setStoreForm] = useState({
    store_name: '',
    support_email: '',
    support_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    logo_url: '',
  });
  const [savingStore, setSavingStore] = useState(false);
  const [storeError, setStoreError] = useState('');

  const load = useCallback(async () => {
    setPageLoading(true);
    try {
      const [p, s] = await Promise.all([getAdminProfile(), getStoreSettings()]);
      setProfileName(p.full_name ?? '');
      setProfilePhone(p.phone ?? '');
      setStoreForm({
        store_name: s.store_name ?? '',
        support_email: s.support_email ?? '',
        support_phone: s.support_phone ?? '',
        address_line1: s.address_line1 ?? '',
        address_line2: s.address_line2 ?? '',
        city: s.city ?? '',
        state: s.state ?? '',
        pincode: s.pincode ?? '',
        gst_number: s.gst_number ?? '',
        logo_url: s.logo_url ?? '',
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const phoneTrim = profilePhone.trim();
      const updated = await patchAdminProfile({
        full_name: profileName.trim(),
        phone: phoneTrim === '' ? null : phoneTrim,
      });
      setProfileName(updated.full_name ?? '');
      setProfilePhone(updated.phone ?? '');
      toast.success('Profile updated');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSavingPassword(true);
    try {
      await postChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreError('');
    setSavingStore(true);
    try {
      const body = {
        store_name: storeForm.store_name.trim(),
        support_email: storeForm.support_email.trim() || null,
        support_phone: storeForm.support_phone.trim() || null,
        address_line1: storeForm.address_line1.trim() || null,
        address_line2: storeForm.address_line2.trim() || null,
        city: storeForm.city.trim() || null,
        state: storeForm.state.trim() || null,
        pincode: storeForm.pincode.trim() || null,
        gst_number: storeForm.gst_number.trim() || null,
        logo_url: storeForm.logo_url.trim() || null,
      };
      const updated = await patchStoreSettings(body);
      setStoreForm({
        store_name: updated.store_name ?? '',
        support_email: updated.support_email ?? '',
        support_phone: updated.support_phone ?? '',
        address_line1: updated.address_line1 ?? '',
        address_line2: updated.address_line2 ?? '',
        city: updated.city ?? '',
        state: updated.state ?? '',
        pincode: updated.pincode ?? '',
        gst_number: updated.gst_number ?? '',
        logo_url: updated.logo_url ?? '',
      });
      toast.success('Store settings saved');
    } catch (err) {
      setStoreError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingStore(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-brand-primary-600" size={32} />
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'store', label: 'Store info', icon: Store },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Settings size={24} className="text-brand-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">Manage your account and storefront details</p>

      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ${
              tab === id
                ? 'border-brand-primary-600 text-brand-primary-700 border border-brand-primary-600 bg-white rounded-lg'
                : 'border-transparent text-gray-500 hover:text-brand-primary-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Administrator profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                id="phone"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                placeholder="10-digit mobile"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to clear. Must be 10 digits if set.</p>
            </div>
            {profileError && (
              <div className="flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {profileError}
              </div>
            )}
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-60 transition"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : null}
              Save profile
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Change password</h2>
          <p className="text-sm text-gray-500 mb-4">
            Re-enter your current password to confirm it is you. Use a strong password you do not reuse elsewhere.
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Current password <span className="text-red-500">*</span>
              </label>
              <input
                id="current_password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1.5">
                New password <span className="text-red-500">*</span>
              </label>
              <input
                id="new_password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                required
                minLength={8}
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {passwordError}
              </div>
            )}
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-60 transition"
            >
              {savingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
              Update password
            </button>
          </form>
        </div>
      )}

      {tab === 'store' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Store & business</h2>
          <p className="text-sm text-gray-500 mb-6">
            Shown on receipts and customer-facing pages when wired. Logo URL must be <code className="text-xs bg-gray-100 px-1 rounded">https://</code>.
          </p>
          <form onSubmit={handleSaveStore} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Store name <span className="text-red-500">*</span>
              </label>
              <input
                id="store_name"
                value={storeForm.store_name}
                onChange={(e) => setStoreForm((f) => ({ ...f, store_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="support_email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Support email
              </label>
              <input
                id="support_email"
                type="email"
                value={storeForm.support_email}
                onChange={(e) => setStoreForm((f) => ({ ...f, support_email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label htmlFor="support_phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Support phone
              </label>
              <input
                id="support_phone"
                value={storeForm.support_phone}
                onChange={(e) =>
                  setStoreForm((f) => ({ ...f, support_phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
                }
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1.5">
                Address line 1
              </label>
              <input
                id="address_line1"
                value={storeForm.address_line1}
                onChange={(e) => setStoreForm((f) => ({ ...f, address_line1: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1.5">
                Address line 2
              </label>
              <input
                id="address_line2"
                value={storeForm.address_line2}
                onChange={(e) => setStoreForm((f) => ({ ...f, address_line2: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
                City
              </label>
              <input
                id="city"
                value={storeForm.city}
                onChange={(e) => setStoreForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1.5">
                State
              </label>
              <input
                id="state"
                value={storeForm.state}
                onChange={(e) => setStoreForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1.5">
                Pincode
              </label>
              <input
                id="pincode"
                value={storeForm.pincode}
                onChange={(e) => setStoreForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div>
              <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-1.5">
                GST number
              </label>
              <input
                id="gst_number"
                value={storeForm.gst_number}
                onChange={(e) => setStoreForm((f) => ({ ...f, gst_number: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1.5">
                Logo URL (https)
              </label>
              <input
                id="logo_url"
                type="url"
                value={storeForm.logo_url}
                onChange={(e) => setStoreForm((f) => ({ ...f, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
            </div>
            {storeError && (
              <div className="sm:col-span-2 flex items-center gap-2 text-sm text-status-danger-700 bg-status-danger-50 border border-status-danger-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {storeError}
              </div>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingStore}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 disabled:opacity-60 transition"
              >
                {savingStore ? <Loader2 size={14} className="animate-spin" /> : null}
                Save store settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
