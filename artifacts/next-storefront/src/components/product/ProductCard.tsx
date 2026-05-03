import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatPrice, decodeSlug } from '@/lib/products';
import type { WooProduct } from '@/types/woocommerce';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: WooProduct;
  locale: string;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({ product, locale, className, priority = false }: ProductCardProps) {
  const isAr = locale === 'ar';
  const primaryImage = product.images[0];
  const primaryCategory = product.categories[0];
  const hasSale = product.on_sale && product.sale_price && product.regular_price;
  const isOutOfStock = product.stock_status === 'outofstock';

  return (
    <Link
      href={`/product/${decodeSlug(product.slug)}`}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200',
        'transition-all duration-200 hover:shadow-md hover:ring-accent-300',
        isOutOfStock && 'opacity-75',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-neutral-100">
        {primaryImage?.src ? (
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
            <svg
              className="h-12 w-12 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {hasSale && (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {isAr ? 'تخفيض' : 'Sale'}
            </span>
          )}
          {product.featured && !hasSale && (
            <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {isAr ? 'مميز' : 'Featured'}
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-neutral-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {isAr ? 'نفد' : 'Sold Out'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {primaryCategory && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-500">
            {primaryCategory.name}
          </p>
        )}

        <h3 className="flex-1 text-sm font-semibold leading-snug text-primary-800 transition-colors group-hover:text-accent-600 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          {hasSale ? (
            <>
              <span className="font-bold text-accent-600">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.regular_price)}
              </span>
            </>
          ) : product.price ? (
            <span className="font-bold text-accent-600">
              {formatPrice(product.price)}
            </span>
          ) : (
            <span className="text-sm text-neutral-400">
              {isAr ? 'السعر غير متاح' : 'Price unavailable'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
