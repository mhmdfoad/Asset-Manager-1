import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AccountNav from '@/components/auth/AccountNav';

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(locale === 'ar' ? '/login' : '/en/login');

  const isAr = locale === 'ar';

  const navLabels = isAr
    ? {
        dashboard: 'لوحة التحكم',
        orders: 'طلباتي',
        addresses: 'عناويني',
        profile: 'بياناتي',
        logout: 'تسجيل الخروج',
      }
    : {
        dashboard: 'Dashboard',
        orders: 'My Orders',
        addresses: 'My Addresses',
        profile: 'My Profile',
        logout: 'Log Out',
      };

  return (
    <div className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Sidebar nav */}
        <aside className="w-full flex-shrink-0 lg:w-56">
          <AccountNav user={user!} locale={locale} labels={navLabels} />
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
