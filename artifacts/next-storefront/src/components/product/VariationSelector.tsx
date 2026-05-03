'use client';

import { cn } from '@/lib/utils';
import { normalizeAttributeName } from '@/lib/variations';
import type { ProductAttribute } from '@/types/woocommerce';

interface VariationSelectorProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  availableOptions: Record<string, Set<string>>;
  onSelect: (attributeName: string, option: string) => void;
  locale: string;
}

export default function VariationSelector({
  attributes,
  selectedAttributes,
  availableOptions,
  onSelect,
  locale,
}: VariationSelectorProps) {
  const isAr = locale === 'ar';

  const variationAttrs = attributes.filter((a) => a.variation);
  if (variationAttrs.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {variationAttrs.map((attr) => {
        const attrKey = normalizeAttributeName(attr.name);
        const selectedValue = selectedAttributes[attrKey] ?? '';
        const available = availableOptions[attrKey] ?? new Set(attr.options);

        return (
          <div key={attr.id} className="flex flex-col gap-2.5">
            {/* Label row */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-800">{attr.name}</span>
              {selectedValue && (
                <span className="text-sm text-neutral-500">
                  {isAr ? ': ' : ': '}
                  <span className="font-medium text-neutral-700">{selectedValue}</span>
                </span>
              )}
              {!selectedValue && (
                <span className="text-xs text-neutral-400">
                  {isAr ? '— اختر خياراً' : '— choose an option'}
                </span>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-2" role="group" aria-label={attr.name}>
              {attr.options.map((option) => {
                const isSelected = normalizeAttributeName(selectedValue) === normalizeAttributeName(option);
                const isAvailable = available.has(option);

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isSelected) {
                        onSelect(attrKey, '');
                      } else {
                        onSelect(attrKey, option);
                      }
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${attr.name}: ${option}`}
                    className={cn(
                      'relative rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                      isSelected
                        ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm'
                        : isAvailable
                        ? 'border-neutral-200 bg-white text-neutral-700 hover:border-accent-300 hover:bg-accent-50'
                        : 'cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300'
                    )}
                  >
                    {option}
                    {/* Strike-through for unavailable */}
                    {!isAvailable && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      >
                        <span className="h-px w-[80%] rotate-45 bg-neutral-300" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
