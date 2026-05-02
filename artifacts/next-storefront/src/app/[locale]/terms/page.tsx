import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="الشروط والأحكام"
      titleEn="Terms & Conditions"
      descAr="شروط الاستخدام وسياسات المتجر"
      descEn="Usage terms and store policies"
      breadcrumbs={[
        {
          labelAr: 'الشروط والأحكام',
          labelEn: 'Terms & Conditions',
          href: '/terms',
        },
      ]}
    />
  );
}
