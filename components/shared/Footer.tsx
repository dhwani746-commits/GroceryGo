'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Package } from 'lucide-react';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';

export function Footer() {
  const { storeName, supportEmail, supportPhone, address } = useStoreSettings();

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package size={20} className="text-brand-primary-400" />
            <h3 className="text-white font-bold text-lg">{storeName}</h3>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Quality household plastic products, delivered fast across India.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Home',       href: '/' },
              { label: 'All Products', href: '/search' },
              { label: 'My Orders',  href: '/orders' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'Addresses',  href: '/addresses' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
            Contact Us
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="flex-shrink-0 text-neutral-400" />
              <a href={`tel:${supportPhone}`} className="hover:text-white transition-colors">
                {supportPhone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="flex-shrink-0 text-neutral-400" />
              <a
                href={`mailto:${supportEmail}`}
                className="hover:text-white transition-colors"
              >
                {supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="flex-shrink-0 text-neutral-400 mt-0.5" />
              <span>{address}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
