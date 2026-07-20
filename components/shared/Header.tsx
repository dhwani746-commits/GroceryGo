'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/store/cart';
import { useEffect, useState } from 'react';
import { ShoppingCart, LogIn, Search, Menu, X, UserCircle, ChevronDown, Clock, MapPin, Mail, LogOut, BarChart3, Package } from 'lucide-react';
import { CartOverlay } from '@/components/store/CartOverlay';
import { MenuOverlay } from './MenuOverlay';
import { Logo } from './Logo';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  /** Hide the search bar on task-focused pages (checkout, orders, account, etc.) */
  hideSearch?: boolean;
}

export function Header({ hideSearch = false }: HeaderProps) {
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();
  const { items } = useCart();
  const [signingOut, setSigningOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Show skeleton only on first load, not on subsequent cached loads
  if (loading) {
    return (
      <header className="bg-white border-b border-neutral-200 fixed w-full z-50">
        <div className="max-w-[90rem] mx-auto py-3 md:py-5 px-4 md:px-6 flex justify-between items-center">
          <div className="w-32 h-8 bg-neutral-200 rounded animate-pulse"></div>
          <div className="flex gap-3 items-center ml-auto">
            <div className="w-10 h-10 bg-neutral-200 rounded-md animate-pulse"></div>
            <div className="w-20 h-10 bg-neutral-200 rounded-md animate-pulse hidden lg:block"></div>
          </div>
        </div>
        <div className="max-w-[90rem] mx-auto px-4 md:px-6 pb-3 md:pb-4">
          <div className="w-full h-12 bg-neutral-200 rounded-md animate-pulse"></div>
        </div>
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
            <>
              {/* mobile menu toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-neutral-700 hover:text-neutral-900 transition flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-100 lg:hidden"
              >
                {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>

              {/* desktop account dropdown */}
              <div className="hidden lg:block relative" data-user-menu>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 transition h-10 text-neutral-700"
                >
                  <UserCircle size={20} strokeWidth={1.5} />
                  <span className="font-semibold">{profile?.full_name || profile?.name || 'My Account'}</span>
                  <ChevronDown size={16} strokeWidth={1.5} className={`transition ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-md shadow-lg z-50">
                    {isAdmin ? (
                      <>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart3 size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Dashboard
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Products
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Clock size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Orders
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserCircle size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Your Account
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Clock size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Your Orders
                        </Link>
                        <Link
                          href="/addresses"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <MapPin size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Addresses
                        </Link>
                        <Link
                          href="/contact"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Mail size={16} strokeWidth={1.5} className="text-neutral-500" />
                          Contact Us
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); handleSignOut(); }}
                      disabled={signingOut}
                      className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-status-danger-700 hover:bg-status-danger-50 transition disabled:opacity-50"
                    >
                      <LogOut size={16} strokeWidth={1.5} />
                      {signingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* mobile login icon — opens modal */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-neutral-700 hover:text-neutral-900 transition flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-100 lg:hidden"
                aria-label="Sign in"
              >
                <LogIn size={20} strokeWidth={1.5} />
              </button>

              {/* desktop login button — opens modal */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:inline-flex bg-brand-accent-500 text-white px-4 py-2 rounded-md hover:bg-brand-primary-500 transition font-medium h-10 items-center"
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar — hidden on task-focused pages (checkout, orders, account) */}
      {!hideSearch && (
        <div className={`max-w-[90rem] mx-auto px-4 md:px-6 pb-3 md:pb-4 ${isCartOpen ? 'hidden lg:block' : ''}`}>
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
      )}

      {/* Mobile Menu Overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      {/* Cart Overlay */}
      <CartOverlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
