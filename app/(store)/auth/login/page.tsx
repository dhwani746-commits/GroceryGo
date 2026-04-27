import { AuthForm } from '@/components/store/AuthForm';

export default function LoginPage() {
  return (
    <div className="space-y-6 border border-brand-primary-200 p-6 rounded-lg shadow-lg bg-neutral-0 max-w-md mx-auto mt-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary-600">Sign In</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Enter your credentials to access your account
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
