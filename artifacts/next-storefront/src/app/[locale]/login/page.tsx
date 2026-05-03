import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login | تسجيل الدخول' };

export default async function LoginPage({
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
        emailOrUsername: 'البريد الإلكتروني أو اسم المستخدم',
        password: 'كلمة المرور',
        login: 'تسجيل الدخول',
        loggingIn: 'جاري تسجيل الدخول...',
        forgotPassword: 'نسيت كلمة المرور؟',
        noAccount: 'ليس لديك حساب؟',
        register: 'إنشاء حساب',
        error: 'بيانات الدخول غير صحيحة.',
      }
    : {
        emailOrUsername: 'Email or Username',
        password: 'Password',
        login: 'Log In',
        loggingIn: 'Logging in…',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        register: 'Register',
        error: 'Invalid credentials.',
      };

  const title = isAr ? 'تسجيل الدخول' : 'Log In';
  const subtitle = isAr
    ? 'أدخل بياناتك للوصول إلى حسابك'
    : 'Enter your details to access your account';

  return (
    <div className="container flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-accent-600">
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span>/</span>
          <span className="font-medium text-primary-800">{title}</span>
        </nav>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-primary-800">{title}</h1>
            <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>
          </div>
          <LoginForm labels={labels} />
        </div>
      </div>
    </div>
  );
}
