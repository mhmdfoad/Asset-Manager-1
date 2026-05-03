import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getProducts, parseSortOption } from '@/lib/products';
import ProductGrid from '@/components/product/ProductGrid';
import SortSelect from '@/components/shop/SortSelect';
import SearchBar from '@/components/shop/SearchBar';
import ShopPagination from '@/components/shop/ShopPagination';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import type { SortOption } from '@/types/woocommerce';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'المتجر' : 'Shop',
    description:
      locale === 'ar'
        ? 'تصفح جميع المنتجات والفئات'
        : 'Browse all products and categories',
    openGraph: {
      title: locale === 'ar' ? 'المتجر' : 'Shop',
    },
  };
}

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const isAr = locale === 'ar';

  const sort = (getString(sp.sort) || 'latest') as SortOption;
  const search = getString(sp.q);
  const page = Math.max(1, parseInt(getString(sp.page, '1'), 10) || 1);
  const perPage = 12;

  const { orderby, order } = parseSortOption(sort);

  const result = await getProducts({
    page,
    per_page: perPage,
    orderby,
    order,
    search: search || undefined,
  }).catch(() => ({ data: [], total: 0, totalPages: 0 }));

  const { data: products, total, totalPages } = result;

  const cleanSearchParams: Record<string, string> = {};
  if (sort && sort !== 'latest') cleanSearchParams.sort = sort;
  if (search) cleanSearchParams.q = search;

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-8">
          <nav className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-accent-600">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <span className="font-medium text-primary-800">{isAr ? 'المتجر' : 'Shop'}</span>
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-800">
                {isAr ? 'المتجر' : 'Shop'}
              </h1>
              {total > 0 && (
                <p className="mt-1 text-sm text-neutral-500">
                  {isAr ? `${total} منتج` : `${total} products`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="container flex flex-wrap items-center gap-3 py-3">
          <Suspense fallback={null}>
            <SearchBar defaultValue={search} locale={locale} />
            <SortSelect currentSort={sort} locale={locale} />
          </Suspense>
        </div>
      </div>

      {/* Products */}
      <div className="container py-10">
        <ProductGrid products={products} locale={locale} firstPriority />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <ShopPagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/shop"
              searchParams={cleanSearchParams}
              locale={locale}
            />
          </div>
        )}
      </div>
    </div>
  );
}
