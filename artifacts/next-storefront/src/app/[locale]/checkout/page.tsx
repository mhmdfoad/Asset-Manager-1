import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | إتمام الشراء',
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-4">
          <nav
            className="flex items-center gap-2 text-sm text-neutral-500"
            aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}
          >
            <Link href="/" className="transition-colors hover:text-accent-600">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/cart" className="transition-colors hover:text-accent-600">
              {isAr ? 'السلة' : 'Cart'}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-primary-800">
              {isAr ? 'إتمام الشراء' : 'Checkout'}
            </span>
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-primary-800 lg:text-3xl">
            {isAr ? 'إتمام الشراء' : 'Checkout'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {isAr
              ? 'أكمل بياناتك لتأكيد طلبك'
              : 'Complete your details to confirm your order'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container py-10">
        <CheckoutForm locale={locale} />
      </div>
    </div>
  );
}
