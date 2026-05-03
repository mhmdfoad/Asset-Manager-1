import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProductPriceProps {
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  priceRange?: { min: string; max: string } | null;
  locale: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductPrice({
  price,
  regularPrice,
  salePrice,
  onSale,
  priceRange,
  locale,
  className,
  size = 'lg',
}: ProductPriceProps) {
  const isAr = locale === 'ar';
  const hasSale = onSale && salePrice && regularPrice;

  const sizeClasses = {
    sm: { current: 'text-lg font-bold', original: 'text-sm', badge: 'text-xs px-2 py-0.5' },
    md: { current: 'text-xl font-bold', original: 'text-base', badge: 'text-xs px-2.5 py-0.5' },
    lg: { current: 'text-3xl font-bold', original: 'text-lg', badge: 'text-sm px-3 py-0.5' },
  };

  const classes = sizeClasses[size];

  if (priceRange && !price) {
    const samePrice = priceRange.min === priceRange.max;
    return (
      <div className={cn('flex items-baseline gap-3', className)}>
        <span className={cn(classes.current, 'text-accent-600')}>
          {samePrice
            ? formatPrice(priceRange.min)
            : `${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}`}
        </span>
        {!samePrice && (
          <span className="text-sm text-neutral-400">
            {isAr ? 'حسب الخيار' : 'varies by option'}
          </span>
        )}
      </div>
    );
  }

  if (hasSale) {
    const discount = regularPrice && salePrice
      ? Math.round(((parseFloat(regularPrice) - parseFloat(salePrice)) / parseFloat(regularPrice)) * 100)
      : 0;

    return (
      <div className={cn('flex flex-wrap items-baseline gap-3', className)}>
        <span className={cn(classes.current, 'text-accent-600')}>
          {formatPrice(salePrice)}
        </span>
        <span className={cn(classes.original, 'text-neutral-400 line-through')}>
          {formatPrice(regularPrice)}
        </span>
        {discount > 0 && (
          <span className={cn('rounded-full bg-red-100 font-bold text-red-600', classes.badge)}>
            -{discount}%
          </span>
        )}
      </div>
    );
  }

  if (price) {
    return (
      <div className={cn('flex items-baseline', className)}>
        <span className={cn(classes.current, 'text-accent-600')}>
          {formatPrice(price)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-baseline', className)}>
      <span className="text-neutral-400">{isAr ? 'السعر غير متاح' : 'Price unavailable'}</span>
    </div>
  );
}
