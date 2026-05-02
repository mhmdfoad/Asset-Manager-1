import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="إتمام الشراء"
      titleEn="Checkout"
      descAr="أدخل بيانات الشحن والدفع"
      descEn="Enter your shipping and payment details"
      breadcrumbs={[
        { labelAr: 'السلة', labelEn: 'Cart', href: '/cart' },
        { labelAr: 'الدفع', labelEn: 'Checkout', href: '/checkout' },
      ]}
    />
  );
}
