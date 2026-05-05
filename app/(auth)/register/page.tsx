import { AuthForm } from '@/components/store/AuthForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign up to start shopping at Krishna Plastics
        </p>
      </div>
      <AuthForm mode="register" />
      <p className="text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
