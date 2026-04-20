import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className = 'text-3xl font-bold' }: LogoProps) {
  const logo = (
    <span className={className}>
      <span className="text-brand-primary-600">Plasti</span>
      <span className="text-brand-accent-500">Kart</span>
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
