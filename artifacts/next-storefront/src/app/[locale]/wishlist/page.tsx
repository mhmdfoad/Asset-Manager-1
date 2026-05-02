import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="المفضلة"
      titleEn="Wishlist"
      descAr="المنتجات المحفوظة في قائمة المفضلة"
      descEn="Products saved in your wishlist"
      breadcrumbs={[
        { labelAr: 'المفضلة', labelEn: 'Wishlist', href: '/wishlist' },
      ]}
    />
  );
}
