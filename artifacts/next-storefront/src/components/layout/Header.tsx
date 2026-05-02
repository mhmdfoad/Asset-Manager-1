import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  locale: string;
}

export default async function Header({ locale }: HeaderProps) {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile Menu (left in RTL, right in LTR) */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-bold tracking-tight text-primary-800 hover:text-primary-700"
        >
          <span className="text-accent-500">●</span>{' '}
          {locale === 'ar' ? 'متجر' : 'Store'}
        </Link>

        {/* Desktop Navigation (center) */}
        <Navigation className="hidden items-center gap-7 lg:flex" />

        {/* Right-side actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Link
            href="/search"
            aria-label={t('search')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label={t('wishlist')}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600 sm:flex"
          >
            <Heart className="h-4.5 w-4.5" />
          </Link>

          {/* Account */}
          <Link
            href="/account"
            aria-label={t('account')}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600 sm:flex"
          >
            <User className="h-4.5 w-4.5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={t('cart')}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {/* Badge placeholder — Phase 2 will wire up real cart count */}
            <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
              0
            </span>
          </Link>

          {/* Language Switcher — desktop only */}
          <div className="ms-2 hidden lg:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
