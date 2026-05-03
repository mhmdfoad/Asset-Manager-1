import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { XCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Failed | فشل الدفع',
};

export default async function OrderFailedPage({
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
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>

      {/* Title */}
      <h1 className="mt-6 text-3xl font-bold text-primary-800">
        {isAr ? 'فشل الدفع' : 'Payment Failed'}
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
          ? 'عذراً، لم تتم عملية الدفع بنجاح. يرجى المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة.'
          : 'Sorry, your payment could not be processed. Please try again or choose a different payment method.'}
      </p>

      {/* Help box */}
      <div className="mt-8 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-start">
        <h2 className="mb-3 font-bold text-red-800">
          {isAr ? 'ماذا يمكنك فعله؟' : 'What can you do?'}
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-red-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">•</span>
            {isAr
              ? 'تحقق من بيانات بطاقتك وأعد المحاولة.'
              : 'Verify your card details and try again.'}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">•</span>
            {isAr
              ? 'جرّب طريقة دفع مختلفة.'
              : 'Try a different payment method.'}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">•</span>
            {isAr
              ? 'تواصل مع البنك الخاص بك إذا استمرت المشكلة.'
              : 'Contact your bank if the problem persists.'}
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/checkout"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-accent-400"
        >
          <RefreshCw className="h-4 w-4" />
          {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </Link>
        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-3.5 font-semibold text-primary-800 transition-colors hover:border-accent-300 hover:bg-accent-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {isAr ? 'العودة للسلة' : 'Return to Cart'}
        </Link>
      </div>
    </div>
  );
}
