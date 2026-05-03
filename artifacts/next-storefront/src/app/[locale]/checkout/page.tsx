import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { getCurrentUser, wpAuthGet } from '@/lib/auth';
import type { WpAddresses, WpProfile } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | إتمام الشراء',
};

export interface CheckoutPrefillData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    address_1: string;
    address_2: string;
    postcode: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    country: string;
    state: string;
    city: string;
    address_1: string;
    address_2: string;
    postcode: string;
  };
}

/** Build prefill data from saved profile + addresses. Never throws — returns null on any failure. */
async function getCheckoutPrefill(): Promise<CheckoutPrefillData | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Fetch addresses and profile in parallel — both are optional
    const [addresses, profile] = await Promise.all([
      wpAuthGet<WpAddresses>('/addresses'),
      wpAuthGet<WpProfile>('/profile'),
    ]);

    const s = (val: string | undefined | null) => (val ?? '').trim();

    // Prefer saved billing address meta; fall back to user object
    const billing = {
      first_name: s(addresses?.billing_first_name) || s(user.first_name),
      last_name: s(addresses?.billing_last_name) || s(user.last_name),
      email: s(addresses?.billing_email) || s(user.email),
      phone: s(addresses?.billing_phone) || s(profile?.billing_phone),
      country: s(addresses?.billing_country),
      state: s(addresses?.billing_state),
      city: s(addresses?.billing_city),
      address_1: s(addresses?.billing_address_1),
      address_2: s(addresses?.billing_address_2),
      postcode: s(addresses?.billing_postcode),
    };

    const shipping = {
      first_name: s(addresses?.shipping_first_name) || billing.first_name,
      last_name: s(addresses?.shipping_last_name) || billing.last_name,
      country: s(addresses?.shipping_country) || billing.country,
      state: s(addresses?.shipping_state) || billing.state,
      city: s(addresses?.shipping_city) || billing.city,
      address_1: s(addresses?.shipping_address_1) || billing.address_1,
      address_2: s(addresses?.shipping_address_2) || billing.address_2,
      postcode: s(addresses?.shipping_postcode) || billing.postcode,
    };

    // Only return prefill if at least name is available (avoids empty banner for new users)
    if (!billing.first_name && !billing.last_name && !billing.email) return null;

    return { billing, shipping };
  } catch {
    // Never block checkout on auth errors
    return null;
  }
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  // Fetch prefill data server-side — token stays in HTTP-only cookie, never sent to client
  const prefillData = await getCheckoutPrefill();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-4">
          <nav
            className="flex items-center gap-2 text-sm text-neutral-500"
            aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}
          >
            <Link href="/" className="transition-colors hover:text-accent-600">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/cart" className="transition-colors hover:text-accent-600">
              {isAr ? 'السلة' : 'Cart'}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-primary-800">
              {isAr ? 'إتمام الشراء' : 'Checkout'}
            </span>
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-primary-800 lg:text-3xl">
            {isAr ? 'إتمام الشراء' : 'Checkout'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {isAr
              ? 'أكمل بياناتك لتأكيد طلبك'
              : 'Complete your details to confirm your order'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container py-10">
        <CheckoutForm locale={locale} prefillData={prefillData} />
      </div>
    </div>
  );
}
