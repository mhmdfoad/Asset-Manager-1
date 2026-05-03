import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CheckCircle2, ShoppingBag, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed | تم تأكيد الطلب',
};

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string; order_key?: string }>;
}) {
  const { locale } = await params;
  const { order_id } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      {/* Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>

      {/* Title */}
      <h1 className="mt-6 text-3xl font-bold text-primary-800">
        {isAr ? 'تم تأكيد طلبك بنجاح! 🎉' : 'Order Confirmed!'}
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
          ? 'شكراً لك! تم استلام طلبك وسيتم معالجته في أقرب وقت. ستصلك رسالة تأكيد على بريدك الإلكتروني.'
          : 'Thank you! Your order has been received and will be processed shortly. A confirmation email has been sent to you.'}
      </p>

      {/* Info cards */}
      <div className="mt-8 grid w-full max-w-md gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-start">
          <Mail className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700">
            {isAr
              ? 'سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.'
              : 'Order details will be sent to your email address.'}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-start">
          <ShoppingBag className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">
            {isAr
              ? 'يمكنك متابعة حالة طلبك من خلال رسائل البريد الإلكتروني المرسلة.'
              : 'You can track your order status through the emails sent to you.'}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
        >
          <ShoppingBag className="h-4 w-4" />
          {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
        </Link>
      </div>
    </div>
  );
}
