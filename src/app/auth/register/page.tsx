import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6 border border-brand-accent-200 p-6 rounded-lg shadow-lg bg-neutral-0 max-w-md mx-auto mt-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-accent-700">Create Account</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sign up to start shopping at PlastiKart
        </p>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
