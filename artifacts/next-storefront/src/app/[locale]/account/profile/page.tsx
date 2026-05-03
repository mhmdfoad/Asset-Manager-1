import { setRequestLocale } from 'next-intl/server';
import { wpAuthGet } from '@/lib/auth';
import type { WpProfile } from '@/lib/auth';
import ProfileForm from '@/components/auth/ProfileForm';

export default async function AccountProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === 'ar';
  const profile = await wpAuthGet<WpProfile>('/profile');

  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {isAr ? 'تعذّر تحميل بيانات الملف الشخصي.' : 'Failed to load profile data.'}
      </div>
    );
  }

  const labels = isAr
    ? {
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        displayName: 'الاسم المعروض',
        phone: 'رقم الجوال',
        email: 'البريد الإلكتروني',
        saveChanges: 'حفظ التغييرات',
        saving: 'جاري الحفظ...',
        profileUpdated: 'تم تحديث الملف الشخصي بنجاح.',
        error: 'فشل تحديث الملف الشخصي.',
      }
    : {
        firstName: 'First Name',
        lastName: 'Last Name',
        displayName: 'Display Name',
        phone: 'Phone Number',
        email: 'Email Address',
        saveChanges: 'Save Changes',
        saving: 'Saving…',
        profileUpdated: 'Profile updated successfully.',
        error: 'Failed to update profile.',
      };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-primary-800">
        {isAr ? 'بياناتي' : 'My Profile'}
      </h1>
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <ProfileForm profile={profile} labels={labels} />
      </div>
    </div>
  );
}
