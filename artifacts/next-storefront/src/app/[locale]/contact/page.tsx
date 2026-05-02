import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="اتصل بنا"
      titleEn="Contact Us"
      descAr="تواصل مع فريق الدعم"
      descEn="Get in touch with our support team"
      breadcrumbs={[
        { labelAr: 'اتصل بنا', labelEn: 'Contact', href: '/contact' },
      ]}
    />
  );
}
