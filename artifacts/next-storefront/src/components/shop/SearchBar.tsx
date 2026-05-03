'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
  locale: string;
}

export default function SearchBar({ defaultValue = '', locale }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const isAr = locale === 'ar';

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [value, router, pathname, searchParams]
  );

  const handleClear = useCallback(() => {
    setValue('');
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete('q');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isAr ? 'ابحث عن منتجات...' : 'Search products...'}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pe-10 ps-10 text-sm text-primary-800 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label={isAr ? 'مسح البحث' : 'Clear search'}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
