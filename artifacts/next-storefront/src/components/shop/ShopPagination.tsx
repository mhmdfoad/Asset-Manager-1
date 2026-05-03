import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
  locale: string;
}

function buildUrl(basePath: string, params: Record<string, string>, page: number) {
  const p = new URLSearchParams(params);
  if (page === 1) {
    p.delete('page');
  } else {
    p.set('page', String(page));
  }
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function ShopPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
  locale,
}: ShopPaginationProps) {
  const isAr = locale === 'ar';
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label={isAr ? 'تصفح الصفحات' : 'Pagination'}
      className="flex items-center justify-center gap-1"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(basePath, searchParams, currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-accent-300 hover:text-accent-600"
          aria-label={isAr ? 'السابق' : 'Previous'}
        >
          <PrevIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-300">
          <PrevIcon className="h-4 w-4" />
        </span>
      )}

      {/* Pages */}
      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(basePath, searchParams, page)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-accent-500 text-white shadow-sm'
                : 'border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:border-accent-300 hover:text-accent-600'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(basePath, searchParams, currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-accent-300 hover:text-accent-600"
          aria-label={isAr ? 'التالي' : 'Next'}
        >
          <NextIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-300">
          <NextIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
