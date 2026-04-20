# Phase 3: Authentication - Step-by-Step Guide

## Prerequisites Checklist

Before starting Phase 3, ensure Phase 2 is complete:
- [ ] Supabase project created and configured
- [ ] 7 database tables created
- [ ] RLS policies enabled
- [ ] Admin user created (admin@plastikart.com)
- [ ] `.env.local` has Supabase credentials
- [ ] Dev server running without errors

---

## Overview: What Phase 3 Includes

Phase 3 builds the complete authentication system:

1. **Customer Sign-Up** - Email + password with OTP verification
2. **Customer Login** - Sign in with existing account
3. **Password Reset** - Recover forgotten passwords
4. **Admin Login** - Role-based login
5. **Session Management** - Keep users logged in
6. **Route Protection** - Middleware guards for protected routes
7. **Role Separation** - Admin vs Customer differentiation

---

## Step 1: Create Auth Components

These are reusable UI components for authentication forms.

### 1.1 Create AuthForm Component

**File:** `src/components/AuthForm.tsx`

This component handles both login and signup forms with email/password validation.

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

interface AuthFormProps {
  mode: 'login' | 'register';
  isAdmin?: boolean;
}

export function AuthForm({ mode, isAdmin = false }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (data?.user) {
          setMessage(
            'Account created! Check your email to confirm your account.'
          );
          setTimeout(() => router.push('/auth/login'), 3000);
        }
      } else {
        // Login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        // Check role if admin login
        if (isAdmin) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', email)
            .single();

          if (profileError || profile?.role !== 'admin') {
            await supabase.auth.signOut();
            throw new Error('Only admins can access this area');
          }
        }

        router.push(isAdmin ? '/admin/dashboard' : '/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );
}
```

### 1.2 Save the Component

Create file: **`src/components/AuthForm.tsx`** with the code above.

---

## Step 2: Update Auth Pages

### 2.1 Login Page

**File:** `src/app/(auth)/login/page.tsx`

```typescript
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="text-sm text-gray-500 text-center">
        Don&apos;t have an account?{' '}
        <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </a>
      </p>
    </div>
  );
}
```

### 2.2 Register Page

**File:** `src/app/(auth)/register/page.tsx`

```typescript
import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign up to start shopping at PlastiKart
        </p>
      </div>
      <AuthForm mode="register" />
      <p className="text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </p>
    </div>
  );
}
```

### 2.3 Admin Login Page

**File:** `src/app/(auth)/admin-login/page.tsx`

```typescript
import { AuthForm } from '@/components/AuthForm';

export default function AdminLoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Sign In</h1>
        <p className="mt-2 text-sm text-gray-600">
          Admin access only. Employees and authorized staff.
        </p>
      </div>
      <AuthForm mode="login" isAdmin={true} />
      <p className="text-sm text-gray-500 text-center">
        <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
          Customer login
        </a>
      </p>
    </div>
  );
}
```

---

## Step 3: Create Auth Utilities

### 3.1 Session Helper

**File:** `src/lib/auth/session.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === 'admin';
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
```

### 3.2 Auth Context (Optional - for client-side state)

**File:** `src/lib/auth/context.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Step 4: Update Root Layout with AuthProvider

**File:** `src/app/layout.tsx`

Add AuthProvider wrapper (if using client-side auth context):

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PlastiKart - Premium Plastic Products',
  description: 'Shop quality plastic containers, buckets, and more at PlastiKart',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## Step 5: Create API Routes for Backend Auth

### 5.1 Sign Out Endpoint

**File:** `src/app/api/auth/signout/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  return NextResponse.json(
    { message: 'Signed out successfully' },
    { status: 200 }
  );
}
```

### 5.2 Get Current User Endpoint

**File:** `src/app/api/auth/me/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user,
    profile,
  });
}
```

---

## Step 6: Test Authentication

### Test 1: Sign Up
1. Go to `http://localhost:3000/auth/register`
2. Enter:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
3. Click "Create Account"
4. Check for confirmation email

### Test 2: Sign In
1. Go to `http://localhost:3000/auth/login`
2. Enter credentials from Test 1
3. Should redirect to home page

### Test 3: Admin Login
1. Go to `http://localhost:3000/auth/admin-login`
2. Enter:
   - Email: admin@plastikart.com
   - Password: (the password you set in Phase 2)
3. Should redirect to `/admin/dashboard`

### Test 4: Protected Routes
1. Sign out
2. Try accessing `/checkout` - should redirect to login
3. Try accessing `/admin/dashboard` - should redirect to login
4. Try accessing `/admin/dashboard` as customer - should redirect to home

---

## Step 7: Create Header Component with Auth Links

**File:** `src/components/Header.tsx`

```typescript
'use client';

import { useAuth } from '@/lib/auth/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-gray-900">
          PlastiKart
        </Link>

        <nav className="flex gap-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-gray-900">
            Cart
          </Link>

          {user && isAdmin ? (
            <>
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                Admin
              </Link>
              <span className="text-sm text-gray-500">{profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </>
          ) : user ? (
            <>
              <Link href="/account" className="text-gray-700 hover:text-gray-900">
                Account
              </Link>
              <span className="text-sm text-gray-500">{profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

Then add to home page `src/app/page.tsx`:

```typescript
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      {/* rest of content */}
    </div>
  );
}
```

---

## ✅ Phase 3 Completion Checklist

- [ ] AuthForm component created (`src/components/AuthForm.tsx`)
- [ ] Login page updated (`src/app/(auth)/login/page.tsx`)
- [ ] Register page updated (`src/app/(auth)/register/page.tsx`)
- [ ] Admin login page created (`src/app/(auth)/admin-login/page.tsx`)
- [ ] Session utilities created (`src/lib/auth/session.ts`)
- [ ] Auth context created (`src/lib/auth/context.tsx`)
- [ ] Root layout updated with AuthProvider
- [ ] Sign out API endpoint created (`src/app/api/auth/signout/route.ts`)
- [ ] Get user API endpoint created (`src/app/api/auth/me/route.ts`)
- [ ] Header component created (`src/components/Header.tsx`)
- [ ] All tests pass (signup, login, protected routes)
- [ ] Can log in as customer and admin
- [ ] Route protection working (redirects to login when needed)

---

## ⏭️ Next: Phase 4 - Product Catalog

Once Phase 3 is complete, Phase 4 will build:
- Product listing page
- Category filtering
- Product detail page
- Admin product CRUD
- Image uploads

**Est. time: 3-4 days**

