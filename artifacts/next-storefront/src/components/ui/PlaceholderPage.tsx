import { Link } from '@/i18n/navigation';

interface PlaceholderPageProps {
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
  locale: string;
  breadcrumbs?: Array<{ labelAr: string; labelEn: string; href: string }>;
}

export default function PlaceholderPage({
  titleAr,
  titleEn,
  descAr,
  descEn,
  locale,
  breadcrumbs,
}: PlaceholderPageProps) {
  const isAr = locale === 'ar';
  const title = isAr ? titleAr : titleEn;
  const desc = isAr ? descAr : descEn;

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container py-8">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
              <Link href="/" className="hover:text-accent-600">
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span>/</span>
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-primary-800 font-medium">
                      {isAr ? crumb.labelAr : crumb.labelEn}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-accent-600">
                      {isAr ? crumb.labelAr : crumb.labelEn}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-3xl font-bold text-primary-800">{title}</h1>
          {desc && <p className="mt-2 text-neutral-600">{desc}</p>}
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 py-24 text-center">
          <div className="mb-4 h-16 w-16 rounded-2xl bg-neutral-200" />
          <p className="text-lg font-semibold text-neutral-700">{title}</p>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            {isAr
              ? 'هذه الصفحة قيد الإنشاء — سيتم إضافة المحتوى في المرحلة القادمة'
              : 'This page is under construction — content will be added in the next phase'}
          </p>
        </div>
      </div>
    </div>
  );
}
