import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-primary-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 opacity-95" />

        <div className="container relative z-10 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-400">
            {locale === 'ar' ? 'مجموعة جديدة' : 'New Collection'}
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/70">
            {t('subtitle')}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
          >
            {t('shopNow')}
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-primary-800">
              {t('categories')}
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Link
                key={i}
                href="/category/demo-category"
                className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-200"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent transition-opacity group-hover:opacity-80" />
                <div className="absolute bottom-0 p-4">
                  <p className="text-sm font-semibold text-white">
                    {locale === 'ar' ? `فئة ${i + 1}` : `Category ${i + 1}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-neutral-100 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-primary-800">
              {t('featuredProducts')}
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent-500" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Link
                key={i}
                href="/product/demo-product"
                className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 transition-all hover:shadow-md hover:ring-accent-300"
              >
                <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-neutral-100" />
                <p className="text-xs text-neutral-600">
                  {locale === 'ar' ? 'فئة المنتج' : 'Product Category'}
                </p>
                <h3 className="mt-1 font-semibold text-primary-800 group-hover:text-accent-600">
                  {locale === 'ar' ? `منتج ${i + 1}` : `Product ${i + 1}`}
                </h3>
                <p className="mt-2 font-bold text-accent-600">
                  {locale === 'ar' ? '١٩٩ ر.س' : 'SAR 199'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Banner */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary-800 p-12 text-center sm:text-start md:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-white">{t('newArrivals')}</h2>
              <p className="mt-3 max-w-sm text-white/70">
                {locale === 'ar'
                  ? 'اكتشف أحدث المنتجات التي وصلت إلى متجرنا'
                  : 'Discover the newest products in our store'}
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 rounded-full border-2 border-accent-500 px-8 py-3 font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
            >
              {t('shopNow')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
