import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr={`فئة: ${slug}`}
      titleEn={`Category: ${slug}`}
      descAr="تصفح منتجات هذه الفئة"
      descEn="Browse products in this category"
      breadcrumbs={[
        { labelAr: 'المتجر', labelEn: 'Shop', href: '/shop' },
        { labelAr: slug, labelEn: slug, href: `/category/${slug}` },
      ]}
    />
  );
}
