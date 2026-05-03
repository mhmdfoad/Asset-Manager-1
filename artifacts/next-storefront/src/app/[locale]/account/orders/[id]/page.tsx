import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { wpAuthGet } from '@/lib/auth';
import type { WpOrderDetail } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, CreditCard, CalendarDays } from 'lucide-react';

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const orderId = parseInt(id, 10);
  if (isNaN(orderId) || orderId <= 0) notFound();

  const order = await wpAuthGet<WpOrderDetail>(`/orders/${orderId}`);
  if (!order) notFound();

  const isAr = locale === 'ar';
  const sym = order.currency_symbol || order.currency;

  const fmt = (val: number | string) =>
    `${sym} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusConfig: Record<string, { label: string; color: string }> = isAr
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
        pending: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700' },
        cancelled: { label: 'Cancelled', color: 'bg-neutral-100 text-neutral-600' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
        'on-hold': { label: 'On Hold', color: 'bg-blue-100 text-blue-700' },
      };

  const status = statusConfig[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' };

  const formattedDate = order.date_created
    ? new Date(order.date_created).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/account/orders"
        className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 hover:text-accent-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {isAr ? 'العودة للطلبات' : 'Back to Orders'}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-800">
            {isAr ? `طلب رقم #${order.number}` : `Order #${order.number}`}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">{formattedDate}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Meta */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4">
          <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
          <div>
            <p className="text-xs text-neutral-400">{isAr ? 'طريقة الدفع' : 'Payment Method'}</p>
            <p className="mt-0.5 text-sm font-semibold text-primary-800">{order.payment_method_title}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4">
          <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
          <div>
            <p className="text-xs text-neutral-400">{isAr ? 'تاريخ الطلب' : 'Order Date'}</p>
            <p className="mt-0.5 text-sm font-semibold text-primary-800">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-neutral-400" />
          <h2 className="text-sm font-bold text-primary-800">{isAr ? 'المنتجات' : 'Items'}</h2>
        </div>
        <div className="flex flex-col divide-y divide-neutral-100">
          {order.line_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-primary-800">{item.name}</p>
                <p className="text-xs text-neutral-400">× {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-accent-600">{fmt(item.total)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-3 flex flex-col gap-1.5 border-t border-dashed border-neutral-100 pt-3">
          {Number(order.discount_total) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'الخصم' : 'Discount'}</span>
              <span className="font-medium text-emerald-600">− {fmt(order.discount_total)}</span>
            </div>
          )}
          {Number(order.shipping_total) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'الشحن' : 'Shipping'}</span>
              <span className="font-medium">{fmt(order.shipping_total)}</span>
            </div>
          )}
          {Number(order.total_tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'الضريبة' : 'Tax'}</span>
              <span className="font-medium">{fmt(order.total_tax)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-100 pt-2">
            <span className="font-bold text-primary-800">{isAr ? 'الإجمالي' : 'Total'}</span>
            <span className="text-lg font-bold text-accent-600">{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Billing */}
      {order.billing && (
        <div className="rounded-xl border border-neutral-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-primary-800">
            {isAr ? 'عنوان الفاتورة' : 'Billing Address'}
          </h2>
          <p className="text-sm text-neutral-600">
            {order.billing.first_name} {order.billing.last_name}
          </p>
          {order.billing.city && (
            <p className="text-sm text-neutral-600">
              {order.billing.city}, {order.billing.country}
            </p>
          )}
          {order.billing.phone && (
            <p className="mt-1 text-sm text-neutral-500">{order.billing.phone}</p>
          )}
        </div>
      )}
    </div>
  );
}
