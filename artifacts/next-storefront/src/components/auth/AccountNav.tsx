import { Link } from '@/i18n/navigation';
import { LayoutDashboard, ShoppingBag, MapPin, User } from 'lucide-react';
import LogoutButton from './LogoutButton';
import type { AuthUser } from '@/lib/auth';

interface AccountNavProps {
  user: AuthUser;
  locale: string;
  labels: {
    dashboard: string;
    orders: string;
    addresses: string;
    profile: string;
    logout: string;
  };
}

const navItems = [
  { href: '/account' as const, labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/account/orders' as const, labelKey: 'orders' as const, icon: ShoppingBag },
  { href: '/account/addresses' as const, labelKey: 'addresses' as const, icon: MapPin },
  { href: '/account/profile' as const, labelKey: 'profile' as const, icon: User },
];

export default function AccountNav({ user, labels }: AccountNavProps) {
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <nav className="flex flex-col gap-1">
      {/* User card */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary-800">
            {user.first_name} {user.last_name}
          </p>
          <p className="truncate text-xs text-neutral-500">{user.email}</p>
        </div>
      </div>

      {/* Nav links */}
      {navItems.map(({ href, labelKey, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
        >
          <Icon className="h-4 w-4" />
          {labels[labelKey]}
        </Link>
      ))}

      <div className="mt-2 border-t border-neutral-100 pt-2">
        <LogoutButton label={labels.logout} />
      </div>
    </nav>
  );
}
