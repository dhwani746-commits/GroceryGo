'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/shared/AuthModal';

export default function RegisterPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      defaultTab="register"
    />
  );
}
