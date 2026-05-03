/**
 * Pure utility functions — no server-only, safe for both server and client components.
 */

export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function encodeSlugForUrl(slug: string): string {
  const decoded = decodeSlug(slug);
  return encodeURIComponent(decoded);
}

export function formatPrice(price: string, currencySymbol?: string): string {
  if (!price) return '';
  const symbol = currencySymbol ?? (typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? ''
    : (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '' : ''));
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${symbol} ${formatted}` : formatted;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
