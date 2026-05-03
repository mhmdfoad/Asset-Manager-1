import type { StockStatus } from '@/types/woocommerce';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  stockStatus: StockStatus;
  stockQuantity?: number | null;
  manageStock?: boolean;
  locale: string;
  className?: string;
}

export default function StockBadge({
  stockStatus,
  stockQuantity,
  manageStock,
  locale,
  className,
}: StockBadgeProps) {
  const isAr = locale === 'ar';

  const isLowStock =
    manageStock && stockQuantity !== null && stockQuantity !== undefined && stockQuantity > 0 && stockQuantity <= 5;

  if (stockStatus === 'outofstock') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200',
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {isAr ? 'نفد من المخزون' : 'Out of Stock'}
      </span>
    );
  }

  if (stockStatus === 'onbackorder') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200',
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {isAr ? 'متاح عند الطلب' : 'Available on Backorder'}
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-200',
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        {isAr ? `آخر ${stockQuantity} قطع` : `Only ${stockQuantity} left`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-200',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      {isAr ? 'متوفر في المخزون' : 'In Stock'}
      {manageStock && stockQuantity !== null && stockQuantity !== undefined && stockQuantity > 5 && (
        <span className="text-green-500">({stockQuantity})</span>
      )}
    </span>
  );
}
