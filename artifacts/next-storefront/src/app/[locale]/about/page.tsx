import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="من نحن"
      titleEn="About Us"
      descAr="تعرف على قصتنا وقيمنا"
      descEn="Learn about our story and values"
      breadcrumbs={[{ labelAr: 'من نحن', labelEn: 'About Us', href: '/about' }]}
    />
  );
}
