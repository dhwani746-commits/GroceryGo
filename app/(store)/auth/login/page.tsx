'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/store/AuthForm';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="space-y-6 border border-brand-primary-200 p-6 rounded-lg shadow-lg bg-neutral-0 max-w-md mx-auto mt-10">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-brand-primary-200">
        <button
          onClick={() => setActiveTab('login')}
          className={`pb-3 px-2 font-semibold transition ${
            activeTab === 'login'
              ? 'text-brand-primary-600 border-b-2 border-brand-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={`pb-3 px-2 font-semibold transition ${
            activeTab === 'signup'
              ? 'text-brand-accent-700 border-b-2 border-brand-accent-700'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'login' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary-600">Sign In</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Enter your credentials to access your account
            </p>
          </div>
          <AuthForm mode="login" />
        </div>
      )}

      {activeTab === 'signup' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-accent-700">Create Account</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Sign up to start shopping at PlastiKart
            </p>
          </div>
          <AuthForm mode="register" />
        </div>
      )}
    </div>
  );
}
