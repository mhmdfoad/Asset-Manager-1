import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, formatPrice, stripHtml } from '@/lib/products';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductCard from '@/components/product/ProductCard';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, Package, Tag, Info } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description = stripHtml(product.short_description || product.description).slice(0, 155);

  return {
    title: product.name,
    description: description || undefined,
    openGraph: {
      title: product.name,
      description: description || undefined,
      images: product.images[0]?.src ? [{ url: product.images[0].src }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isAr = locale === 'ar';
  const hasSale = product.on_sale && product.sale_price && product.regular_price;
  const isOutOfStock = product.stock_status === 'outofstock';
  const isBackorder = product.stock_status === 'onbackorder';
  const shortDesc = stripHtml(product.short_description);
  const fullDesc = stripHtml(product.description);

  const relatedResult = await getRelatedProducts(product.related_ids, 4).catch(() => ({
    data: [],
  }));
  const relatedProducts = relatedResult.data;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-accent-600">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-accent-600">
              {isAr ? 'المتجر' : 'Shop'}
            </Link>
            {product.categories[0] && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="hover:text-accent-600"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-medium text-primary-800 line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Main */}
      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Details */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            {product.categories[0] && (
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="text-sm font-medium uppercase tracking-wide text-accent-500 hover:text-accent-600"
              >
                {product.categories[0].name}
              </Link>
            )}

            <h1 className="text-3xl font-bold text-primary-800 lg:text-4xl">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasSale ? (
                <>
                  <span className="text-2xl font-bold text-accent-600">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-lg text-neutral-400 line-through">
                    {formatPrice(product.regular_price)}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    {isAr ? 'تخفيض' : 'Sale'}
                  </span>
                </>
              ) : product.price ? (
                <span className="text-2xl font-bold text-accent-600">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>

            {/* Short Description */}
            {shortDesc && (
              <p className="leading-relaxed text-neutral-600">{shortDesc}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-neutral-400" />
              {isOutOfStock ? (
                <span className="text-sm font-medium text-red-600">
                  {isAr ? 'نفد من المخزون' : 'Out of Stock'}
                </span>
              ) : isBackorder ? (
                <span className="text-sm font-medium text-amber-600">
                  {isAr ? 'متاح عند الطلب' : 'Available on Backorder'}
                </span>
              ) : (
                <span className="text-sm font-medium text-green-600">
                  {isAr ? 'متوفر في المخزون' : 'In Stock'}
                  {product.manage_stock && product.stock_quantity !== null && (
                    <span className="ms-1 text-neutral-500">
                      ({product.stock_quantity} {isAr ? 'متبقي' : 'left'})
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Variable product notice */}
            {product.type === 'variable' && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700">
                  {isAr
                    ? 'سيتم تطبيق خيارات المنتج في المرحلة القادمة.'
                    : 'Product variations will be implemented in the next phase.'}
                </p>
              </div>
            )}

            {/* Add to Cart — Placeholder */}
            <button
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-3 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock
                ? (isAr ? 'نفد من المخزون' : 'Out of Stock')
                : (isAr ? 'أضف إلى السلة' : 'Add to Cart')}
            </button>

            {/* SKU & Categories */}
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
              {product.sku && (
                <div className="flex gap-2">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span>
                    <span className="font-medium">{isAr ? 'رمز المنتج: ' : 'SKU: '}</span>
                    {product.sku}
                  </span>
                </div>
              )}
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="font-medium">{isAr ? 'الفئات: ' : 'Categories: '}</span>
                  {product.categories.map((cat, i) => (
                    <span key={cat.id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="hover:text-accent-600"
                      >
                        {cat.name}
                      </Link>
                      {i < product.categories.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attributes */}
            {product.attributes.filter((a) => a.visible).length > 0 && (
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  {isAr ? 'تفاصيل المنتج' : 'Product Details'}
                </h3>
                <dl className="flex flex-col gap-2">
                  {product.attributes
                    .filter((a) => a.visible)
                    .map((attr) => (
                      <div key={attr.id} className="flex gap-2 text-sm">
                        <dt className="min-w-[6rem] font-medium text-primary-800">{attr.name}:</dt>
                        <dd className="text-neutral-600">{attr.options.join(', ')}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {fullDesc && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-primary-800">
              {isAr ? 'وصف المنتج' : 'Product Description'}
            </h2>
            <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
              {fullDesc}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 text-2xl font-bold text-primary-800">
              {isAr ? 'منتجات ذات صلة' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
