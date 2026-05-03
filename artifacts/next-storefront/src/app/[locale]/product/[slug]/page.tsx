import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductVariations, getRelatedProducts, stripHtml, decodeSlug } from '@/lib/products';
import { sanitizeWooHtml, getPriceRange } from '@/lib/variations';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPrice from '@/components/product/ProductPrice';
import StockBadge from '@/components/product/StockBadge';
import ProductMeta from '@/components/product/ProductMeta';
import ProductDescription from '@/components/product/ProductDescription';
import VariationClient from '@/components/product/VariationClient';
import SimpleProductClient from '@/components/product/SimpleProductClient';
import ProductCard from '@/components/product/ProductCard';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const isVariable = product.type === 'variable';

  const [variationsResult, relatedResult] = await Promise.allSettled([
    isVariable ? getProductVariations(product.id) : Promise.resolve([]),
    getRelatedProducts(product.related_ids, 4),
  ]);

  const variations = variationsResult.status === 'fulfilled' ? variationsResult.value : [];
  const relatedProducts = relatedResult.status === 'fulfilled' ? relatedResult.value.data : [];

  const hasSale = product.on_sale && product.sale_price && product.regular_price;
  const priceRange = isVariable ? getPriceRange(variations) : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-500" aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}>
            <Link href="/" className="hover:text-accent-600 transition-colors">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/shop" className="hover:text-accent-600 transition-colors">
              {isAr ? 'المتجر' : 'Shop'}
            </Link>
            {product.categories[0] && (
              <>
                <span aria-hidden="true">/</span>
                <Link
                  href={`/category/${decodeSlug(product.categories[0].slug)}`}
                  className="hover:text-accent-600 transition-colors"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="font-medium text-primary-800 line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Main */}
      <div className="container py-12">
        {isVariable && variations.length > 0 ? (
          /* Variable product — fully client-managed */
          <VariationClient product={product} variations={variations} locale={locale} />
        ) : (
          /* Simple product */
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Details */}
            <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              {product.categories[0] && (
                <Link
                  href={`/category/${decodeSlug(product.categories[0].slug)}`}
                  className="text-sm font-medium uppercase tracking-wide text-accent-500 hover:text-accent-600 transition-colors"
                >
                  {product.categories[0].name}
                </Link>
              )}

              <h1 className="text-3xl font-bold text-primary-800 lg:text-4xl">{product.name}</h1>

              <ProductPrice
                price={product.price}
                regularPrice={product.regular_price}
                salePrice={product.sale_price}
                onSale={!!hasSale}
                priceRange={priceRange}
                locale={locale}
              />

              {product.short_description && (
                <div
                  className="leading-relaxed text-neutral-600 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ps-4 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: sanitizeWooHtml(product.short_description) }}
                />
              )}

              <StockBadge
                stockStatus={product.stock_status}
                stockQuantity={product.stock_quantity}
                manageStock={product.manage_stock}
                locale={locale}
              />

              {/* Add to Cart — client component with quantity selector */}
              <SimpleProductClient product={product} locale={locale} />

              <ProductMeta
                sku={product.sku}
                categories={product.categories}
                tags={product.tags}
                locale={locale}
              />

              {/* Visible non-variation attributes */}
              {product.attributes.filter((a) => a.visible && !a.variation).length > 0 && (
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    {isAr ? 'تفاصيل المنتج' : 'Product Details'}
                  </h3>
                  <dl className="flex flex-col gap-2">
                    {product.attributes
                      .filter((a) => a.visible && !a.variation)
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
        )}

        {/* Description & Specs */}
        <ProductDescription
          shortDescription=""
          fullDescription={product.description}
          attributes={product.attributes}
          locale={locale}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary-800">
                  {isAr ? 'منتجات ذات صلة' : 'Related Products'}
                </h2>
                <div className="mt-3 h-1 w-12 rounded-full bg-accent-500" />
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-accent-600 hover:text-accent-500 transition-colors"
              >
                {isAr ? 'عرض الكل' : 'View All'}
              </Link>
            </div>
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
