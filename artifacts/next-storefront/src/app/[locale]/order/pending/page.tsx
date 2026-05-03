import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Clock, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Pending | طلب معلّق',
};

export default async function OrderPendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { locale } = await params;
  const { order_id } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      {/* Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-12 w-12 text-amber-500" />
      </div>

      {/* Title */}
      <h1 className="mt-6 text-3xl font-bold text-primary-800">
        {isAr ? 'طلبك في انتظار الدفع' : 'Order Pending Payment'}
      </h1>

      {order_id && (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          {isAr ? 'رقم الطلب:' : 'Order number:'}{' '}
          <span className="font-bold text-primary-800">#{order_id}</span>
        </p>
      )}

      {/* Description */}
      <p className="mt-4 max-w-md text-neutral-600 leading-relaxed">
        {isAr
          ? 'تم إنشاء طلبك بنجاح وهو في انتظار إتمام الدفع. إذا لم تكمل الدفع، سيتم إلغاء الطلب تلقائياً بعد فترة.'
          : 'Your order has been created and is awaiting payment. If payment is not completed, the order will be automatically cancelled after a period.'}
      </p>

      {/* Info card */}
      <div className="mt-8 w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-5 text-start">
        <h2 className="mb-3 font-bold text-amber-800">
          {isAr ? 'ماذا يحدث الآن؟' : 'What happens next?'}
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">•</span>
            {isAr
              ? 'ستتلقى بريداً إلكترونياً بتفاصيل طلبك.'
              : 'You will receive an email with your order details.'}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">•</span>
            {isAr
              ? 'إذا اخترت الدفع عند الاستلام، سنتواصل معك لتأكيد الطلب.'
              : 'If you chose Cash on Delivery, we will contact you to confirm.'}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">•</span>
            {isAr
              ? 'يمكنك متابعة حالة طلبك من خلال البريد الإلكتروني المرسل.'
              : 'You can track your order status through the confirmation email.'}
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-accent-400"
        >
          <ShoppingBag className="h-4 w-4" />
          {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-3.5 font-semibold text-primary-800 transition-colors hover:border-accent-300 hover:bg-accent-50"
        >
          {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
