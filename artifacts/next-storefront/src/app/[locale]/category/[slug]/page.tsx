import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCategoryBySlug, getProductsByCategory, parseSortOption, stripHtml } from '@/lib/products';
import ProductGrid from '@/components/product/ProductGrid';
import SortSelect from '@/components/shop/SortSelect';
import ShopPagination from '@/components/shop/ShopPagination';
import { Link } from '@/i18n/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { SortOption } from '@/types/woocommerce';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const description = stripHtml(category.description).slice(0, 155);

  return {
    title: category.name,
    description: description || undefined,
    openGraph: {
      title: category.name,
      images: category.image?.src ? [{ url: category.image.src }] : [],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const isAr = locale === 'ar';

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = (getString(sp.sort) || 'latest') as SortOption;
  const page = Math.max(1, parseInt(getString(sp.page, '1'), 10) || 1);
  const perPage = 12;

  const { orderby, order } = parseSortOption(sort);

  const result = await getProductsByCategory(category.id, {
    page,
    per_page: perPage,
    orderby,
    order,
  }).catch(() => ({ data: [], total: 0, totalPages: 0 }));

  const { data: products, total, totalPages } = result;
  const categoryDesc = stripHtml(category.description);

  const cleanSearchParams: Record<string, string> = {};
  if (sort && sort !== 'latest') cleanSearchParams.sort = sort;

  return (
    <div>
      {/* Category Header */}
      <div className="relative border-b border-neutral-200 bg-white">
        {category.image?.src && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={category.image.src}
              alt={category.image.alt || category.name}
              fill
              className="object-cover opacity-10"
              priority
            />
          </div>
        )}
        <div className="container relative py-12">
          <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-accent-600">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-accent-600">
              {isAr ? 'المتجر' : 'Shop'}
            </Link>
            <span>/</span>
            <span className="font-medium text-primary-800">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold text-primary-800 lg:text-4xl">{category.name}</h1>

          {categoryDesc && (
            <p className="mt-3 max-w-2xl text-neutral-600">{categoryDesc}</p>
          )}

          {total > 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              {isAr ? `${total} منتج` : `${total} products`}
            </p>
          )}
        </div>
      </div>

      {/* Sort bar */}
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="container flex items-center justify-end gap-3 py-3">
          <Suspense fallback={null}>
            <SortSelect currentSort={sort} locale={locale} />
          </Suspense>
        </div>
      </div>

      {/* Products */}
      <div className="container py-10">
        <ProductGrid products={products} locale={locale} />

        {totalPages > 1 && (
          <div className="mt-12">
            <ShopPagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/category/${slug}`}
              searchParams={cleanSearchParams}
              locale={locale}
            />
          </div>
        )}
      </div>
    </div>
  );
}
