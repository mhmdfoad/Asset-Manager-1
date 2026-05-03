import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { wpAuthGet } from '@/lib/auth';
import type { WpOrderSummary } from '@/lib/auth';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === 'ar';
  const orders = await wpAuthGet<WpOrderSummary[]>('/orders?per_page=20');

  const statusConfig: Record<string, { label: string; color: string }> = isAr
    ? {
        processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
        completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'بانتظار الدفع', color: 'bg-amber-100 text-amber-700' },
        cancelled: { label: 'ملغي', color: 'bg-neutral-100 text-neutral-600' },
        failed: { label: 'فشل', color: 'bg-red-100 text-red-700' },
        'on-hold': { label: 'معلّق', color: 'bg-blue-100 text-blue-700' },
        refunded: { label: 'مسترجع', color: 'bg-purple-100 text-purple-700' },
      }
    : {
        processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
        completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700' },
        cancelled: { label: 'Cancelled', color: 'bg-neutral-100 text-neutral-600' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
        'on-hold': { label: 'On Hold', color: 'bg-blue-100 text-blue-700' },
        refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
      };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-primary-800">
        {isAr ? 'طلباتي' : 'My Orders'}
      </h1>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="mt-4 font-semibold text-primary-800">
            {isAr ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {isAr ? 'ابدأ التسوق الآن!' : 'Start shopping now!'}
          </p>
          <Link
            href="/shop"
            className="mt-5 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-400"
          >
            {isAr ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const status = statusConfig[order.status] ?? {
              label: order.status,
              color: 'bg-neutral-100 text-neutral-600',
            };
            const sym = order.currency_symbol || order.currency;
            const date = order.date_created
              ? new Date(order.date_created).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—';

            return (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-50">
                    <ShoppingBag className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">#{order.number}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {date} · {order.item_count} {isAr ? 'منتج' : 'items'} · {order.payment_method_title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-sm font-bold text-accent-600">
                    {sym} {Number(order.total).toFixed(2)}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:underline"
                  >
                    {isAr ? 'التفاصيل' : 'Details'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
