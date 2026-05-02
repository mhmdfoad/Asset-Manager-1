import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr={`منتج: ${slug}`}
      titleEn={`Product: ${slug}`}
      descAr="صفحة تفاصيل المنتج"
      descEn="Product detail page"
      breadcrumbs={[
        { labelAr: 'المتجر', labelEn: 'Shop', href: '/shop' },
        { labelAr: slug, labelEn: slug, href: `/product/${slug}` },
      ]}
    />
  );
}
