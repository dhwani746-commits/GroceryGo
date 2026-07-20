'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/shared/AuthModal';

/**
 * /auth/login — shows the AuthModal on top of whatever was already in view.
 * When the modal closes (either via the X button or successful auth), we go back.
 * Also handles ?error= messages forwarded from the OAuth callback.
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get('tab') as 'login' | 'register') ?? 'login';

  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back, or fall back to home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // If the modal was closed via any internal success, also navigate back
  const handleSuccess = () => {
    setIsOpen(false);
    router.back();
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      defaultTab={defaultTab}
    />
  );
}
