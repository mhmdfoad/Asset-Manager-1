import { setRequestLocale } from 'next-intl/server';
import { wpAuthGet } from '@/lib/auth';
import type { WpAddresses } from '@/lib/auth';
import AddressForm from '@/components/auth/AddressForm';

export default async function AccountAddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === 'ar';
  const addresses = (await wpAuthGet<WpAddresses>('/addresses')) ?? {};

  const labels = isAr
    ? {
        billingAddress: 'عنوان الفاتورة',
        shippingAddress: 'عنوان الشحن',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        company: 'الشركة (اختياري)',
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال',
        country: 'الدولة',
        state: 'المنطقة / المحافظة',
        city: 'المدينة',
        address1: 'العنوان',
        address2: 'تفاصيل إضافية (اختياري)',
        postcode: 'الرمز البريدي',
        saveChanges: 'حفظ التغييرات',
        saving: 'جاري الحفظ...',
        addressUpdated: 'تم تحديث العنوان بنجاح',
        error: 'فشل تحديث العنوان. يرجى المحاولة مرة أخرى.',
      }
    : {
        billingAddress: 'Billing Address',
        shippingAddress: 'Shipping Address',
        firstName: 'First Name',
        lastName: 'Last Name',
        company: 'Company (Optional)',
        email: 'Email Address',
        phone: 'Phone Number',
        country: 'Country',
        state: 'State / Region',
        city: 'City',
        address1: 'Address Line 1',
        address2: 'Address Line 2 (Optional)',
        postcode: 'Postcode',
        saveChanges: 'Save Changes',
        saving: 'Saving…',
        addressUpdated: 'Address updated successfully.',
        error: 'Failed to update address. Please try again.',
      };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-primary-800">
        {isAr ? 'عناويني' : 'My Addresses'}
      </h1>
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <AddressForm addresses={addresses} labels={labels} />
      </div>
    </div>
  );
}
