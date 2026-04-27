'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, Settings, ShoppingCart, Tag, X, User, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export function AdminSidebar({ isOpen, onClose, username }: AdminSidebarProps) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 h-[100dvh] flex flex-col ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64 w-64'
        }`}
      >
        <nav className="p-4 py-6 md:py-8 space-y-4 w-64 flex flex-col h-full overflow-y-auto">
          {/* Header with Close Button */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div className="font-bold text-lg text-brand-primary-600">PlastiKart Admin
              <div className="text-sm text-gray-500">MANAGEMENT PORTAL</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700 md:hidden flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-4">
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-white rounded transition"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-white rounded transition"
            >
              <Package size={20} />
              Products
            </Link>
            <Link
              href="/admin/orders"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-white rounded transition"
            >
              <ShoppingCart size={20} />
              Orders
            </Link>
            <Link
              href="/admin/promos"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-white rounded transition"
            >
              <Tag size={20} />
              Promo Codes
            </Link>
            <Link
              href="/admin/account"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-white rounded transition"
            >
              <Settings size={20} />
              Settings
            </Link>
          </div>

          {/* User Info at Bottom */}
          {username && (
            <div className="pt-4 border-t border-black-400">
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg">
                <div className="p-2 bg-brand-primary-100 rounded-full">
                  <User size={18} className="text-brand-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{username}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-2 text-gray-500 hover:text-status-danger-600 hover:bg-status-danger-50 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
