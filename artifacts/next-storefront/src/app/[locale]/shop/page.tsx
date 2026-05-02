import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="المتجر"
      titleEn="Shop"
      descAr="تصفح جميع المنتجات والفئات"
      descEn="Browse all products and categories"
      breadcrumbs={[{ labelAr: 'المتجر', labelEn: 'Shop', href: '/shop' }]}
    />
  );
}
