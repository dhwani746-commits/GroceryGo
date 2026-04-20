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
        <a
          href="/auth/register"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
