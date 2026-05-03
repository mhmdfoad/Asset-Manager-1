import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import RegisterForm from '@/components/auth/RegisterForm';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Register | إنشاء حساب' };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) redirect(locale === 'ar' ? '/account' : '/en/account');

  const isAr = locale === 'ar';

  const labels = isAr
    ? {
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال (اختياري)',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        register: 'إنشاء الحساب',
        registering: 'جاري إنشاء الحساب...',
        haveAccount: 'لديك حساب بالفعل؟',
        login: 'تسجيل الدخول',
        error: 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
      }
    : {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone (Optional)',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        register: 'Create Account',
        registering: 'Creating account…',
        haveAccount: 'Already have an account?',
        login: 'Log In',
        error: 'Registration failed. Please try again.',
      };

  const title = isAr ? 'إنشاء حساب جديد' : 'Create an Account';
  const subtitle = isAr
    ? 'انضم إلينا اليوم وابدأ التسوق'
    : 'Join us today and start shopping';

  return (
    <div className="container flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-accent-600">
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span>/</span>
          <span className="font-medium text-primary-800">{isAr ? 'إنشاء حساب' : 'Register'}</span>
        </nav>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-primary-800">{title}</h1>
            <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>
          </div>
          <RegisterForm labels={labels} />
        </div>
      </div>
    </div>
  );
}
