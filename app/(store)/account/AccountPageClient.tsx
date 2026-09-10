'use client';

import { Header } from '@/components/shared/Header';
import { EditProfileModal } from '@/components/shared/EditProfileModal';
import { ChangePasswordModal } from '@/components/shared/ChangePasswordModal';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield, Edit, LogOut } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

async function updateProfile(profileData: { full_name: string; phone: string | null }) {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

interface AccountPageClientProps {
  user: any;
  profile: any;
  orders: any[];
}

async function changePassword(passwordData: { currentPassword: string; newPassword: string }) {
  const response = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
}

export default function AccountPageClient({ user, profile, orders }: AccountPageClientProps) {
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSaveProfile = async (updatedProfile: { full_name: string; phone: string | null }) => {
    try {
      const updatedData = await updateProfile(updatedProfile);
      setCurrentProfile(updatedData);
    } catch (error) {
      throw error;
    }
  };

  const handleChangePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    await changePassword(passwordData);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header hideSearch />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: 'My Account' }]}
          className="mb-6"
        />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary-500 to-brand-accent-500 rounded-full flex items-center justify-center">
            <UserCircle size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
            <p className="text-neutral-600">Manage your profile and orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Account Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Profile Information</h2>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm text-brand-primary-600 hover:text-brand-primary-800 transition"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCircle size={20} className="text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Full Name</p>
                    <p className="font-medium text-neutral-900">
                      {currentProfile?.full_name || currentProfile?.name || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Email Address</p>
                    <p className="font-medium text-neutral-900">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Phone Number</p>
                    <p className="font-medium text-neutral-900">
                      {currentProfile?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Member Since</p>
                    <p className="font-medium text-neutral-900">
                      {new Date(user.created_at || currentProfile?.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
                <Link
                  href="/orders"
                  className="text-sm text-brand-primary-600 hover:text-brand-primary-800 transition"
                >
                  View All
                </Link>
              </div>
              
              {(!orders || orders.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No orders yet</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-brand-primary-600 text-white px-4 py-2 rounded-lg hover:bg-brand-primary-700 transition text-sm font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 2).map((order: any) => (
                    <div key={order.id} className="border border-neutral-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">
                            Order #{order.id.split('-')[0].toUpperCase()}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-status-success-100 text-status-success-800'
                              : order.status === 'cancelled'
                              ? 'bg-status-danger-100 text-status-danger-800'
                              : 'bg-status-warning-100 text-status-warning-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center gap-3 text-neutral-700 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50 text-left"
                >
                  <Edit size={20} className="text-neutral-400" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </button>
                
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center gap-3 text-neutral-700 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50 text-left"
                >
                  <Shield size={20} className="text-neutral-400" />
                  <span className="text-sm font-medium">Change Password</span>
                </button>
                
                <form action="/api/auth/signout" method="POST">
                  <input type="hidden" name="redirect" value="/" />
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 text-status-danger-600 hover:text-status-danger-800 transition p-2 rounded-lg hover:bg-status-danger-50 text-left"
                  >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 text-neutral-700 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50"
                >
                  <UserCircle size={20} className="text-neutral-400" />
                  <span className="text-sm font-medium">View Orders</span>
                </Link>
                
                <Link
                  href="/addresses"
                  className="flex items-center gap-3 text-neutral-700 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50"
                >
                  <MapPin size={20} className="text-neutral-400" />
                  <span className="text-sm font-medium">Manage Addresses</span>
                </Link>
                
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-neutral-700 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50"
                >
                  <Mail size={20} className="text-neutral-400" />
                  <span className="text-sm font-medium">Contact Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={currentProfile ? { ...currentProfile, email: user.email } : null}
        onSave={handleSaveProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleChangePassword}
      />
    </div>
  );
}
