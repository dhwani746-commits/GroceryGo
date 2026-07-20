'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AuthForm } from '@/components/store/AuthForm';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Start on 'login' or 'register' tab */
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync tab when modal opens with a different default
  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  // Lock body scroll & handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // Trap focus inside the modal when open
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* Portal-style fixed overlay */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
      aria-label="Sign in or create account"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel — capped height so it always fits in viewport */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md max-h-[90dvh] flex flex-col bg-white rounded-2xl shadow-2xl outline-none overflow-hidden"
      >
        {/* Sticky header inside the modal */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 flex-shrink-0">
          <Logo />
          <button
            onClick={onClose}
            className="ml-auto text-neutral-400 hover:text-neutral-700 transition rounded-lg p-1.5 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 flex-shrink-0 px-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-3 pt-3 px-2 mr-4 font-semibold text-sm transition border-b-2 ${
              activeTab === 'login'
                ? 'text-brand-primary-600 border-brand-primary-600'
                : 'text-neutral-500 border-transparent hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 pt-3 px-2 font-semibold text-sm transition border-b-2 ${
              activeTab === 'register'
                ? 'text-brand-accent-700 border-brand-accent-700'
                : 'text-neutral-500 border-transparent hover:text-neutral-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-brand-primary-700">Welcome back</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Enter your credentials to access your account
                </p>
              </div>
              <AuthForm mode="login" onSuccess={onClose} />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-brand-accent-700">Create Account</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Sign up to start shopping at Krishna Plastics
                </p>
              </div>
              <AuthForm mode="register" onSuccess={onClose} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
