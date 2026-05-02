'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

interface NavigationProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function Navigation({ className, onLinkClick }: NavigationProps) {
  const t = useTranslations('Nav');
  const pathname = usePathname();

  return (
    <nav className={className}>
      {NAV_LINKS.map(({ key, href }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href);

        return (
          <Link
            key={key}
            href={href}
            onClick={onLinkClick}
            className={cn(
              'relative text-sm font-medium transition-colors',
              'after:absolute after:-bottom-1 after:start-0 after:h-0.5 after:w-full',
              'after:origin-start after:scale-x-0 after:rounded-full after:bg-accent-500',
              'after:transition-transform hover:text-accent-600',
              'hover:after:scale-x-100',
              isActive
                ? 'text-accent-600 after:scale-x-100'
                : 'text-neutral-700',
            )}
          >
            {t(key as any)}
          </Link>
        );
      })}
    </nav>
  );
}
