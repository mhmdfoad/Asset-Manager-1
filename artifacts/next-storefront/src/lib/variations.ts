import type { WooProductVariation, ProductAttribute } from '@/types/woocommerce';

/**
 * Normalize an attribute name for use as a key in selectedAttributes.
 * Lowercases and trims so "Color", "color", "اللون" all stay consistent.
 */
export function normalizeAttributeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Get the selected option value for a given attribute name from a variation.
 * WooCommerce variation attributes use the attribute name to match.
 * An empty string option means "any value" (wildcard).
 */
export function getVariationAttributeValue(
  variation: WooProductVariation,
  attributeName: string
): string {
  const normalized = normalizeAttributeName(attributeName);
  const found = variation.attributes.find(
    (a) => normalizeAttributeName(a.name) === normalized
  );
  if (!found) return '';
  // WooCommerce may return the option as a URL-encoded slug (e.g. "5-%d9%84%d8%aa%d8%b1")
  // Decode it and replace slug dashes with spaces to match display labels (e.g. "5 لتر")
  let option = found.option;
  try { option = decodeURIComponent(option); } catch {}
  option = option.replace(/-/g, ' ').trim();
  return option;
}

/**
 * Find the variation that matches the current selectedAttributes map.
 * selectedAttributes: { [normalizedAttrName]: selectedOptionValue }
 * A variation matches when every attribute in selectedAttributes matches:
 * - The variation's attribute option equals the selected value, OR
 * - The variation's attribute option is "" (wildcard / any)
 * Returns null if no match or if selectedAttributes is incomplete.
 */
export function findMatchingVariation(
  variations: WooProductVariation[],
  selectedAttributes: Record<string, string>
): WooProductVariation | null {
  const selectedEntries = Object.entries(selectedAttributes).filter(([, v]) => v !== '');
  if (selectedEntries.length === 0) return null;

  return (
    variations.find((variation) => {
      return selectedEntries.every(([attrName, selectedValue]) => {
        const variationValue = getVariationAttributeValue(variation, attrName);
        return variationValue === '' || normalizeAttributeName(variationValue) === normalizeAttributeName(selectedValue);
      });
    }) ?? null
  );
}

/**
 * Given all product variation attributes (from product.attributes where variation=true),
 * and the current selectedAttributes, return which options are still available
 * for each attribute (i.e., lead to at least one purchasable variation).
 *
 * Returns: { [normalizedAttrName]: Set<optionValue> }
 */
export function getAvailableOptions(
  variationAttributes: ProductAttribute[],
  variations: WooProductVariation[],
  selectedAttributes: Record<string, string>
): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {};

  for (const attr of variationAttributes) {
    const attrKey = normalizeAttributeName(attr.name);
    const available = new Set<string>();

    for (const option of attr.options) {
      // Build a test selection: current selection but with this attr set to this option
      const testSelection: Record<string, string> = {
        ...selectedAttributes,
        [attrKey]: option,
      };

      // Check if any variation matches this test selection
      const matches = variations.some((variation) => {
        return Object.entries(testSelection).every(([key, value]) => {
          if (!value) return true;
          const varValue = getVariationAttributeValue(variation, key);
          return varValue === '' || normalizeAttributeName(varValue) === normalizeAttributeName(value);
        });
      });

      if (matches) {
        available.add(option);
      }
    }

    result[attrKey] = available;
  }

  return result;
}

/**
 * Returns true if a variation is purchasable and in stock (or on backorder).
 */
export function isVariationInStock(variation: WooProductVariation): boolean {
  return variation.purchasable && variation.stock_status !== 'outofstock';
}

/**
 * Get the price range across all variations.
 * Returns { min, max } price strings, or null if no variations have prices.
 */
export function getPriceRange(variations: WooProductVariation[]): { min: string; max: string } | null {
  const prices = variations
    .map((v) => parseFloat(v.price))
    .filter((p) => !isNaN(p));

  if (prices.length === 0) return null;

  const min = Math.min(...prices).toFixed(2);
  const max = Math.max(...prices).toFixed(2);
  return { min, max };
}

/**
 * Check if all variation attributes have been selected.
 */
export function isSelectionComplete(
  variationAttributes: ProductAttribute[],
  selectedAttributes: Record<string, string>
): boolean {
  return variationAttributes
    .filter((a) => a.variation)
    .every((a) => {
      const key = normalizeAttributeName(a.name);
      return !!selectedAttributes[key];
    });
}

/**
 * Sanitize HTML from WooCommerce to prevent XSS.
 * Strips script, iframe, object, embed tags and event handler attributes.
 * Safe to use with dangerouslySetInnerHTML after running this.
 */
export function sanitizeWooHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
