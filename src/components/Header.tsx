'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useCart } from '@/lib/store/cart';
import { useEffect, useState } from 'react';
import { ShoppingCart, UserCircle, LogIn, Clock, MapPin, Mail, LogOut, Search, Menu, X } from 'lucide-react';
import { CartOverlay } from './CartOverlay';
import { Logo } from './Logo';

export function Header() {
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();
  const { items } = useCart();
  const [signingOut, setSigningOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  if (loading) {
    return (
      <header className="bg-neutral-0 border-b border-neutral-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 text-neutral-700">Loading...</div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-neutral-200 fixed w-full z-50">
      {/* Top Row: Logo, Cart, Hamburger/SignIn */}
      <div className="max-w-[90rem] mx-auto py-3 md:py-5 px-4 md:px-6 flex justify-between items-center">
        <Logo />
        
        <div className="flex gap-3 items-center ml-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-neutral-700 hover:text-neutral-900 transition flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-100"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-status-danger-500 text-white text-sm font-bold rounded-md w-5 h-5 flex items-center justify-center pointer-events-none">
                {cartCount}
              </span>
            )}
          </button>

          {user && profile ? (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-700 hover:text-neutral-900 transition flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-100"
            >
              {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-neutral-700 hover:text-neutral-900 transition flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-100"
            >
              <LogIn size={20} strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-[90rem] mx-auto px-4 md:px-6 pb-3 md:pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 md:py-4 pl-12 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent bg-neutral-50 text-base"
            />
            <Search size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && user && profile && (
        <div className="max-w-[90rem] mx-auto px-4 pb-3 border-t border-neutral-200 bg-neutral-50">
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            <UserCircle size={16} strokeWidth={1.5} className="text-neutral-500" />
            Your Account
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            <Clock size={16} strokeWidth={1.5} className="text-neutral-500" />
            Your Orders
          </Link>
          <Link
            href="/addresses"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            <MapPin size={16} strokeWidth={1.5} className="text-neutral-500" />
            Addresses
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            <Mail size={16} strokeWidth={1.5} className="text-neutral-500" />
            Contact Us
          </Link>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleSignOut();
            }}
            disabled={signingOut}
            className="w-full flex items-center gap-3 text-left px-3 py-2 text-sm text-status-danger-700 hover:bg-status-danger-50 transition rounded-md disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.5} />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}

      <CartOverlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
