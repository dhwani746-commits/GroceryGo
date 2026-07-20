/**
 * Auth layout — intentionally minimal.
 * Each page (/auth/login, /auth/register) renders an AuthModal that positions
 * itself as a fixed overlay, so no centering wrapper is needed here.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
