'use client';

import { useRouter } from 'next/navigation';
import { X, UserCircle, Clock, MapPin, Mail, LogOut, BarChart3, Package } from 'lucide-react';
import { useEffect } from 'react';
import { Logo } from './Logo';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
}

export function MenuOverlay({
  isOpen,
  onClose,
  user,
  profile,
  isAdmin,
  onSignOut,
  signingOut,
}: MenuOverlayProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!user) return null;

  const MenuItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
    <button
      onClick={() => handleNavigate(href)}
      className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition rounded-md border border-neutral-200"
    >
      <Icon size={20} strokeWidth={1.5} className="text-neutral-500" />
      <span className="font-medium">{label}</span>
    </button>
  );

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
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out w-72 lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-neutral-200">
          <h2 className="text-sm text-neutral-900"> <Logo className='text-xl font-bold' /> </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition rounded-md p-2 hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-4 space-y-2 overflow-y-auto flex-1">
          {isAdmin ? (
            <>
              <MenuItem icon={BarChart3} label="Dashboard" href="/admin/dashboard" />
              <MenuItem icon={Package} label="Products" href="/admin/products" />
              <MenuItem icon={Clock} label="Orders" href="/admin/orders" />
            </>
          ) : (
            <>
              <MenuItem icon={UserCircle} label="Your Account" href="/account" />
              <MenuItem icon={Clock} label="Your Orders" href="/orders" />
              <MenuItem icon={MapPin} label="Addresses" href="/addresses" />
              <MenuItem icon={Mail} label="Contact Us" href="/contact" />
            </>
          )}

        </div>

        {/* User Profile Section at Bottom */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-primary-100 text-brand-primary-700 flex items-center justify-center font-bold text-lg">
                {(profile?.full_name || profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-neutral-900 truncate">
                {profile?.full_name || profile?.name || 'My Account'}
              </span>
              <span className="text-xs text-neutral-500 truncate">
                {user?.email || profile?.phone || 'Customer'}
              </span>
            </div>
          </div>

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
