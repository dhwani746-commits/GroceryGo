'use client';

import Link from 'next/link';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className = 'text-3xl font-bold' }: LogoProps) {
  const { storeName } = useStoreSettings();
  
  // Split name to color the first word differently
  const words = storeName.split(' ');
  const firstWord = words[0] || 'Krishna';
  const restOfName = words.slice(1).join(' ') || 'Plastics';

  const logo = (
    <span className={className}>
      <span className="text-brand-primary-600">{firstWord} </span>
      <span className="text-brand-accent-500">{restOfName}</span>
    </span>
  );

  if (href === '/') {
    return (
      <Link href={href} className="hover:opacity-80 transition">
        {logo}
      </Link>
    );
  }

  return logo;
}
