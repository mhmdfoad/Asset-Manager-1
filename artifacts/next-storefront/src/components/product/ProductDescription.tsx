'use client';

import { cn } from '@/lib/utils';
import { sanitizeWooHtml } from '@/lib/variations';

interface ProductDescriptionProps {
  shortDescription?: string;
  fullDescription?: string;
  attributes?: Array<{ id: number; name: string; options: string[]; visible: boolean }>;
  locale: string;
  className?: string;
}

export default function ProductDescription({
  shortDescription,
  fullDescription,
  attributes,
  locale,
  className,
}: ProductDescriptionProps) {
  const isAr = locale === 'ar';
  const visibleAttributes = attributes?.filter((a) => a.visible) ?? [];
  const hasContent = shortDescription || fullDescription || visibleAttributes.length > 0;
  if (!hasContent) return null;

  return (
    <div className={cn('mt-16 border-t border-neutral-100 pt-12', className)}>
      {/* Full description */}
      {fullDescription && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-primary-800">
            {isAr ? 'وصف المنتج' : 'Product Description'}
          </h2>
          <div
            className={cn(
              'prose prose-neutral max-w-none text-neutral-600',
              '[&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5',
              '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary-800',
              '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary-700',
              '[&_strong]:font-semibold [&_strong]:text-primary-800',
              '[&_a]:text-accent-600 [&_a]:underline [&_a:hover]:text-accent-500',
              '[&_table]:w-full [&_table]:border-collapse',
              '[&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:p-2 [&_th]:text-start',
              '[&_td]:border [&_td]:border-neutral-200 [&_td]:p-2'
            )}
            dangerouslySetInnerHTML={{ __html: sanitizeWooHtml(fullDescription) }}
          />
        </div>
      )}

      {/* Attributes table */}
      {visibleAttributes.length > 0 && (
        <div className={fullDescription ? 'mt-12' : ''}>
          <h2 className="mb-6 text-2xl font-bold text-primary-800">
            {isAr ? 'مواصفات المنتج' : 'Product Specifications'}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <table className="w-full text-sm">
              <tbody>
                {visibleAttributes.map((attr, i) => (
                  <tr
                    key={attr.id}
                    className={i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}
                  >
                    <th
                      scope="row"
                      className="w-1/3 px-5 py-3 text-start font-semibold text-primary-800"
                    >
                      {attr.name}
                    </th>
                    <td className="px-5 py-3 text-neutral-600">
                      {attr.options.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
