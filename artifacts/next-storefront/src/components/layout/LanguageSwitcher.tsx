'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('LanguageSwitcher');

  const handleSwitch = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={handleSwitch}
      aria-label={t('switchTo')}
      className={cn(
        'flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5',
        'text-sm font-medium text-neutral-700 transition-colors',
        'hover:border-accent-400 hover:text-accent-600',
        className,
      )}
    >
      <Globe className="h-3.5 w-3.5 shrink-0" />
      <span>{t('switchTo')}</span>
    </button>
  );
}
