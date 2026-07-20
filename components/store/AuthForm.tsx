'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

interface AuthFormProps {
  mode: 'login' | 'register';
  isAdmin?: boolean;
  /** Called after a successful sign-in/sign-up so a parent modal can close */
  onSuccess?: () => void;
}

export function AuthForm({ mode, isAdmin = false, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      if (urlError) {
        setError(decodeURIComponent(urlError));
      }
    }
  }, []);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to initiate sign-in with ${provider}`);
      setLoading(false);
    }
  };

  const validateIndianPhone = (phone: string): boolean => {
    // Phone should be just 10 digits starting with 6-9 (without +91)
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Validate phone number for registration
    if (mode === 'register' && phone && !validateIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone ? '+91' + phone : null,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (data?.user) {
          console.log('User created successfully:', data.user);
          console.log('User metadata:', data.user.user_metadata);

          // Send OTP for email verification
          try {
            const otpResponse = await fetch('/api/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });

            const otpData = await otpResponse.json();

            if (!otpResponse.ok) {
              throw new Error(otpData.error || 'Failed to send verification email');
            }

            // Redirect to OTP verification page
            router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
          } catch (otpError) {
            console.error('OTP send error:', otpError);
            setMessage(
              'Account created! Please check your email to verify your account.'
            );
            setEmail('');
            setPassword('');
            setFullName('');
            setPhone('');
            setTimeout(() => router.push('/auth/login'), 3000);
          }
        }
      } else {
        // Login
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        if (data?.user) {
          // Verify profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileError) throw profileError;

          // Check admin access
          if (isAdmin && profile?.role?.toUpperCase() !== 'ADMIN') {
            await supabase.auth.signOut();
            throw new Error('Only admins can access this part');
          }

          // Check if user is admin and needs OTP verification
          if (profile?.role?.toUpperCase() === 'ADMIN') {
            try {
              // Send OTP for admin verification
              const otpResponse = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });

              const otpData = await otpResponse.json();

              if (!otpResponse.ok) {
                throw new Error(otpData.error || 'Failed to send verification email');
              }

              // Redirect to admin OTP verification page
              router.push(`/auth/admin-verify-otp?email=${encodeURIComponent(email)}`);
              return;
            } catch (otpError) {
              console.error('Admin OTP send error:', otpError);
              // Continue with normal login if OTP fails
            }
          }

          // Invalidate auth cache so Header UI updates
          await queryClient.invalidateQueries({ queryKey: ['auth'] });

          // Close parent modal first (if any), then redirect
          onSuccess?.();

          // Redirect based on role
          if (isAdmin || profile?.role?.toUpperCase() === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.refresh();
          }
        }
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
        <>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-900">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 bg-neutral-0"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-900">
              Phone Number
            </label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 font-medium">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  // Allow only digits, max 10 characters, must start with 6-9
                  let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);

                  // Only allow if first digit is 6-9 or empty
                  if (value === '' || /^[6-9]/.test(value)) {
                    setPhone(value);
                  }
                }}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 rounded-r-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 bg-neutral-0"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">10-digit Indian mobile number starting with 6-9</p>
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 bg-neutral-0"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 bg-neutral-0"
        />
      </div>

      {error && (
        <div className="rounded-md bg-status-danger-50 p-4 text-sm text-status-danger-700 border border-status-danger-100">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md bg-status-success-50 p-4 text-sm text-status-success-700 border border-status-success-100">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary-600 text-white py-1 rounded-md font-medium hover:bg-brand-primary-500 transition disabled:opacity-50 h-10 cursor-pointer"
      >
        {loading ? 'Loading...' : mode === 'register' ? 'Create Account' : 'Sign In'}
      </button>

      {!isAdmin && (
        <>
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-neutral-500 uppercase tracking-wider font-semibold">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 disabled:opacity-50 transition cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.65 4.5 1.8l2.4-2.4C17.34 1.7 14.94 1 12.24 1c-5.5 0-10 4.5-10 10s4.5 10 10 10c5.5 0 10-4.5 10-10 0-.7-.1-1.3-.24-1.715H12.24z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 disabled:opacity-50 transition cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>
        </>
      )}

      {mode === 'login' ? (
        <p className="text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-brand-primary-600 hover:text-brand-primary-500 font-medium">
            Sign up
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-primary-600 hover:text-brand-primary-500 font-medium">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
