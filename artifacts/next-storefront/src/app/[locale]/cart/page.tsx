import { setRequestLocale } from 'next-intl/server';
import CartPageClient from '@/components/cart/CartPageClient';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | سلة التسوق',
};

export default async function CartPage({
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
            <span className="font-medium text-primary-800">
              {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            </span>
          </nav>
        </div>
      </div>

      <CartPageClient locale={locale} />
    </div>
  );
}
