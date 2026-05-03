'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SortOption } from '@/types/woocommerce';

interface SortSelectProps {
  currentSort: SortOption;
  locale: string;
}

const SORT_OPTIONS: { value: SortOption; labelAr: string; labelEn: string }[] = [
  { value: 'latest', labelAr: 'الأحدث', labelEn: 'Latest' },
  { value: 'price_low', labelAr: 'الأقل سعراً', labelEn: 'Price: Low to High' },
  { value: 'price_high', labelAr: 'الأعلى سعراً', labelEn: 'Price: High to Low' },
  { value: 'popular', labelAr: 'الأكثر مبيعاً', labelEn: 'Most Popular' },
];

export default function SortSelect({ currentSort, locale }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('sort', value);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="shrink-0 text-sm font-medium text-neutral-600"
      >
        {isAr ? 'ترتيب:' : 'Sort:'}
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-primary-800 shadow-sm transition-colors focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {isAr ? opt.labelAr : opt.labelEn}
          </option>
        ))}
      </select>
    </div>
  );
}
