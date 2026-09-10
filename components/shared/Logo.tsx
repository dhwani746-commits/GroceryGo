'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className = '' }: LogoProps) {
  const heightClasses = className.includes('h-') ? className : `h-11 md:h-14 lg:h-16 ${className}`;

  const logoContent = (
    <Image
      src="/logo.png"
      alt="GroceryGo"
      width={240}
      height={140}
      priority
      className={`w-auto object-contain transition-transform duration-200 hover:scale-[1.02] ${heightClasses}`}
    />
  );

  if (href === '/') {
    return (
      <Link href={href} className="hover:opacity-95 transition inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
