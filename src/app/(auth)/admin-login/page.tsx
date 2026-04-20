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
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Customer login
        </a>
      </p>
    </div>
  );
}
