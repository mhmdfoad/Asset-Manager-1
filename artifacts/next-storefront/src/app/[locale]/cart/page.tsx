import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="سلة التسوق"
      titleEn="Shopping Cart"
      descAr="مراجعة المنتجات المضافة إلى السلة"
      descEn="Review items in your cart"
      breadcrumbs={[{ labelAr: 'السلة', labelEn: 'Cart', href: '/cart' }]}
    />
  );
}
