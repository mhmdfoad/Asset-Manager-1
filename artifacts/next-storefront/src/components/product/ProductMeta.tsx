import { Link } from '@/i18n/navigation';
import { decodeSlug } from '@/lib/format';
import type { ProductCategory } from '@/types/woocommerce';

interface ProductMetaProps {
  sku?: string;
  categories: ProductCategory[];
  tags?: Array<{ id: number; name: string; slug: string }>;
  locale: string;
}

export default function ProductMeta({ sku, categories, tags, locale }: ProductMetaProps) {
  const isAr = locale === 'ar';
  const hasContent = sku || categories.length > 0 || (tags && tags.length > 0);
  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-2.5 border-t border-neutral-100 pt-5 text-sm text-neutral-600">
      {sku && (
        <div className="flex items-center gap-2">
          <span className="min-w-[5rem] font-medium text-neutral-500">
            {isAr ? 'الرمز:' : 'SKU:'}
          </span>
          <span className="font-mono text-neutral-700">{sku}</span>
        </div>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className="min-w-[5rem] font-medium text-neutral-500">
            {isAr ? 'الفئة:' : 'Category:'}
          </span>
          <div className="flex flex-wrap gap-1">
            {categories.map((cat, i) => (
              <span key={cat.id}>
                <Link
                  href={`/category/${decodeSlug(cat.slug)}`}
                  className="text-accent-600 hover:text-accent-500 hover:underline"
                >
                  {cat.name}
                </Link>
                {i < categories.length - 1 && (
                  <span className="text-neutral-400">,</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className="min-w-[5rem] font-medium text-neutral-500">
            {isAr ? 'الوسوم:' : 'Tags:'}
          </span>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span key={tag.id} className="text-neutral-600">
                {tag.name}
                {i < tags.length - 1 && (
                  <span className="text-neutral-400">, </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
