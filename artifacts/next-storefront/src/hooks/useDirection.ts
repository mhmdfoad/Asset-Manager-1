'use client';

import { useLocale } from 'next-intl';
import type { Direction } from '@/types';

export function useDirection(): Direction {
  const locale = useLocale();
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function useIsRtl(): boolean {
  const locale = useLocale();
  return locale === 'ar';
}
