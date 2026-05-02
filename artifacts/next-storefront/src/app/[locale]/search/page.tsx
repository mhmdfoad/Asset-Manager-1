import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="نتائج البحث"
      titleEn="Search Results"
      descAr="ابحث عن المنتجات والفئات"
      descEn="Search for products and categories"
      breadcrumbs={[{ labelAr: 'البحث', labelEn: 'Search', href: '/search' }]}
    />
  );
}
