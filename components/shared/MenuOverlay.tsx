'use client';

import { useRouter } from 'next/navigation';
import { X, UserCircle, Clock, MapPin, Mail, LogOut, BarChart3, Package } from 'lucide-react';
import Link from 'next/link';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: boolean;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
}

export function MenuOverlay({
  isOpen,
  onClose,
  user,
  isAdmin,
  onSignOut,
  signingOut,
}: MenuOverlayProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={onClose}
        />
      )}

      {/* Overlay - Left on tablet, full width on mobile */}
      <div
        className={`fixed top-0 h-full bg-white shadow-xl z-100 transform transition-transform duration-300 ease-out w-full lg:hidden ${
          isOpen ? 'translate-x-25' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">Menu</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition rounded-md p-2 hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-4 space-y-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => handleNavigate('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <BarChart3 size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => handleNavigate('/admin/products')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <Package size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Products</span>
              </button>

              <button
                onClick={() => handleNavigate('/admin/orders')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <Clock size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Orders</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate('/account')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <UserCircle size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Your Account</span>
              </button>

              <button
                onClick={() => handleNavigate('/orders')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <Clock size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Your Orders</span>
              </button>

              <button
                onClick={() => handleNavigate('/addresses')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <MapPin size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Addresses</span>
              </button>

              <button
                onClick={() => handleNavigate('/contact')}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
              >
                <Mail size={20} strokeWidth={1.5} className="text-neutral-500" />
                <span className="font-medium">Contact Us</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-status-danger-700 hover:bg-status-danger-50 transition rounded-md border border-status-danger-200 disabled:opacity-50 font-medium"
          >
            <LogOut size={20} strokeWidth={1.5} />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </>
  );
}
