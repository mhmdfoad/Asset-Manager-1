import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="سياسة الخصوصية"
      titleEn="Privacy Policy"
      descAr="كيف نحمي بياناتك الشخصية"
      descEn="How we protect your personal data"
      breadcrumbs={[
        {
          labelAr: 'سياسة الخصوصية',
          labelEn: 'Privacy Policy',
          href: '/privacy-policy',
        },
      ]}
    />
  );
}
