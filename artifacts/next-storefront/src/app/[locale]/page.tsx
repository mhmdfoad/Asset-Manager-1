import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getFeaturedProducts, getLatestProducts, getCategories, formatPrice } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'متجرنا — تسوق أونلاين' : 'Our Store — Shop Online',
    description:
      locale === 'ar'
        ? 'اكتشف أحدث المنتجات والعروض الحصرية بجودة عالية وأسعار تنافسية'
        : 'Discover the latest products and exclusive offers with premium quality and competitive prices',
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const isAr = locale === 'ar';

  const [featuredResult, latestResult, categoriesResult] = await Promise.allSettled([
    getFeaturedProducts(8),
    getLatestProducts(8),
    getCategories({ per_page: 8, hide_empty: true }),
  ]);

  const featuredProducts =
    featuredResult.status === 'fulfilled' ? featuredResult.value.data : [];
  const latestProducts =
    latestResult.status === 'fulfilled' ? latestResult.value.data : [];
  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : [];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : latestProducts;

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-primary-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 opacity-95" />
        <div className="container relative z-10 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-400">
            {isAr ? 'مجموعة جديدة' : 'New Collection'}
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/70">{t('subtitle')}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
          >
            {t('shopNow')}
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary-800">{t('categories')}</h2>
                <div className="mt-4 h-1 w-16 rounded-full bg-accent-500" />
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-accent-600 hover:text-accent-500"
              >
                {isAr ? 'عرض الكل' : 'View All'}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-200"
                >
                  {category.image?.src ? (
                    <Image
                      src={category.image.src}
                      alt={category.image.alt || category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-700 to-primary-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent transition-opacity group-hover:from-primary-900/70" />
                  <div className="absolute bottom-0 p-4">
                    <p className="text-sm font-semibold text-white">{category.name}</p>
                    {category.count > 0 && (
                      <p className="mt-0.5 text-xs text-white/60">
                        {category.count} {isAr ? 'منتج' : 'products'}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured / Latest Products Section */}
      {displayProducts.length > 0 && (
        <section className="bg-neutral-100 py-20">
          <div className="container">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary-800">
                  {featuredProducts.length > 0 ? t('featuredProducts') : t('newArrivals')}
                </h2>
                <div className="mt-4 h-1 w-16 rounded-full bg-accent-500" />
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-accent-600 hover:text-accent-500"
              >
                {isAr ? 'عرض الكل' : 'View All'}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when WooCommerce is not connected */}
      {displayProducts.length === 0 && categories.length === 0 && (
        <section className="py-20">
          <div className="container">
            <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-700">
                {isAr ? 'WooCommerce غير متصل بعد' : 'WooCommerce not connected yet'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                {isAr
                  ? 'أضف متغيرات البيئة الخاصة بـ WooCommerce لعرض المنتجات الحقيقية'
                  : 'Add your WooCommerce environment variables to display real products'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Banner */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary-800 p-12 text-center sm:text-start md:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-white">{t('newArrivals')}</h2>
              <p className="mt-3 max-w-sm text-white/70">
                {isAr
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
