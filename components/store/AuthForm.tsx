'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

interface AuthFormProps {
  mode: 'login' | 'register';
  isAdmin?: boolean;
}

export function AuthForm({ mode, isAdmin = false }: AuthFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
          setEmail('');
          setPassword('');
          setFullName('');
          setTimeout(() => router.push('/auth/login'), 3000);
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
            throw new Error('Only admins can access this area');
          }

          // Invalidate auth cache so Header UI updates
          await queryClient.invalidateQueries({ queryKey: ['auth'] });

          // Redirect based on role
          if (isAdmin || profile?.role?.toUpperCase() === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
          router.refresh();
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
        className="w-full bg-brand-primary-600 text-white py-1 rounded-md font-medium hover:bg-brand-primary-500 transition disabled:opacity-50 h-10"
      >
        {loading ? 'Loading...' : mode === 'register' ? 'Create Account' : 'Sign In'}
      </button>

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
          <Link href="/auth/login" className="text-brand-primary-600 text-md border-b border-brand-primary-600 hover:border">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
