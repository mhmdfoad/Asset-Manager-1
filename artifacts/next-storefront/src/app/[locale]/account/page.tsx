import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentUser, wpAuthGet } from '@/lib/auth';
import type { WpOrderSummary } from '@/lib/auth';
import { ShoppingBag, MapPin, User, ArrowRight } from 'lucide-react';

export default async function AccountDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === 'ar';

  const [user, recentOrders] = await Promise.all([
    getCurrentUser(),
    wpAuthGet<WpOrderSummary[]>('/orders?per_page=3'),
  ]);

  if (!user) return null;

  const statusLabels: Record<string, { label: string; color: string }> = isAr
    ? {
        processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
        completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'بانتظار الدفع', color: 'bg-amber-100 text-amber-700' },
        cancelled: { label: 'ملغي', color: 'bg-neutral-100 text-neutral-600' },
        failed: { label: 'فشل', color: 'bg-red-100 text-red-700' },
        'on-hold': { label: 'معلّق', color: 'bg-blue-100 text-blue-700' },
      }
    : {
        processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
        completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
        cancelled: { label: 'Cancelled', color: 'bg-neutral-100 text-neutral-600' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
        'on-hold': { label: 'On Hold', color: 'bg-blue-100 text-blue-700' },
      };

  const quickLinks = isAr
    ? [
        { href: '/account/orders' as const, icon: ShoppingBag, label: 'طلباتي', desc: 'تتبع حالة طلباتك' },
        { href: '/account/addresses' as const, icon: MapPin, label: 'عناويني', desc: 'إدارة عناوين التوصيل' },
        { href: '/account/profile' as const, icon: User, label: 'بياناتي', desc: 'تعديل معلوماتك الشخصية' },
      ]
    : [
        { href: '/account/orders' as const, icon: ShoppingBag, label: 'My Orders', desc: 'Track your order status' },
        { href: '/account/addresses' as const, icon: MapPin, label: 'My Addresses', desc: 'Manage delivery addresses' },
        { href: '/account/profile' as const, icon: User, label: 'My Profile', desc: 'Edit your personal info' },
      ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-primary-800">
          {isAr ? `مرحباً، ${user.first_name}` : `Welcome back, ${user.first_name}`} 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isAr ? 'مرحباً بك في لوحة حسابك' : "Here's an overview of your account"}
        </p>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:border-accent-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-primary-800">{label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-primary-800">
              {isAr ? 'آخر الطلبات' : 'Recent Orders'}
            </h2>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:underline"
            >
              {isAr ? 'عرض الكل' : 'View all'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const status = statusLabels[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' };
              const sym = order.currency_symbol || order.currency;
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-accent-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50">
                      <ShoppingBag className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-800">#{order.number}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(order.date_created).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-sm font-bold text-accent-600">
                      {sym} {Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
