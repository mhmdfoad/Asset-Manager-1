import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Search, Heart, User, LogIn } from 'lucide-react';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import CartHeaderButton from './CartHeaderButton';
import { getCurrentUser } from '@/lib/auth';

interface HeaderProps {
  locale: string;
}

export default async function Header({ locale }: HeaderProps) {
  const [t, user] = await Promise.all([getTranslations('Nav'), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile Menu */}
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

        {/* Desktop Navigation */}
        <Navigation className="hidden items-center gap-7 lg:flex" />

        {/* Right-side actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label={t('search')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          <Link
            href="/wishlist"
            aria-label={t('wishlist')}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600 sm:flex"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>

          {/* Auth-aware account button */}
          {user ? (
            <Link
              href="/account"
              aria-label={t('account')}
              className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600 sm:flex"
              title={`${user.first_name} ${user.last_name}`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">
                {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label={t('account')}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600 sm:flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          )}

          {/* Cart — client component with live count + drawer trigger */}
          <CartHeaderButton ariaLabel={t('cart')} />

          <div className="ms-2 hidden lg:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
