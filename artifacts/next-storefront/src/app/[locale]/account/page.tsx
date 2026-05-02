import { setRequestLocale } from 'next-intl/server';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      locale={locale}
      titleAr="حسابي"
      titleEn="My Account"
      descAr="إدارة حسابك وطلباتك"
      descEn="Manage your account and orders"
      breadcrumbs={[{ labelAr: 'حسابي', labelEn: 'Account', href: '/account' }]}
    />
  );
}
