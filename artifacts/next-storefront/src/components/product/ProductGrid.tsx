import ProductCard from './ProductCard';
import type { WooProduct } from '@/types/woocommerce';

interface ProductGridProps {
  products: WooProduct[];
  locale: string;
  emptyMessage?: string;
}

export default function ProductGrid({ products, locale, emptyMessage }: ProductGridProps) {
  const isAr = locale === 'ar';

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
          <svg
            className="h-8 w-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-neutral-600">
          {emptyMessage ?? (isAr ? 'لا توجد منتجات' : 'No products found')}
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          {isAr
            ? 'جرب بحثاً مختلفاً أو تصفح الفئات'
            : 'Try a different search or browse categories'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
