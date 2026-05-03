import 'server-only';
import { wcFetch, isConfigured, WooCommerceConfigError } from './woocommerce';
import type {
  WooProduct,
  WooCategory,
  WooProductsParams,
  WooCategoriesParams,
} from '@/types/woocommerce';

function buildProductQuery(
  params: WooProductsParams
): Record<string, string | number | boolean | undefined> {
  return {
    status: params.status ?? 'publish',
    per_page: params.per_page ?? 12,
    page: params.page ?? 1,
    search: params.search,
    category: params.category,
    featured: params.featured,
    on_sale: params.on_sale,
    orderby: params.orderby,
    order: params.order,
    include: params.include,
    exclude: params.exclude,
    lang: params.lang,
  };
}

export async function getProducts(params: WooProductsParams = {}) {
  if (!isConfigured()) return { data: [], total: 0, totalPages: 0 };
  try {
    return await wcFetch<WooProduct[]>('/products', buildProductQuery(params), 60);
  } catch (err) {
    if (err instanceof WooCommerceConfigError) return { data: [], total: 0, totalPages: 0 };
    throw err;
  }
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, per_page: limit, orderby: 'date', order: 'desc' });
}

export async function getLatestProducts(limit = 8) {
  return getProducts({ orderby: 'date', order: 'desc', per_page: limit });
}

export async function getSaleProducts(limit = 8) {
  return getProducts({ on_sale: true, per_page: limit, orderby: 'date', order: 'desc' });
}

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  if (!isConfigured()) return null;
  try {
    const decoded = decodeSlug(slug);
    const result = await wcFetch<WooProduct[]>(
      '/products',
      { slug: decoded, status: 'publish' },
      60
    );
    return result.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function getProductsByCategory(
  categoryId: number,
  params: Omit<WooProductsParams, 'category'> = {}
) {
  return getProducts({ ...params, category: categoryId });
}

export async function getRelatedProducts(relatedIds: number[], limit = 4) {
  if (!isConfigured() || relatedIds.length === 0) return { data: [], total: 0, totalPages: 0 };
  try {
    const uniqueIds = [...new Set(relatedIds)].slice(0, limit);
    const result = await wcFetch<WooProduct[]>(
      '/products',
      { include: uniqueIds.join(','), per_page: limit },
      60
    );
    const seen = new Set<number>();
    const deduped = result.data.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return { ...result, data: deduped };
  } catch {
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getCategories(params: WooCategoriesParams = {}) {
  if (!isConfigured()) return { data: [], total: 0, totalPages: 0 };
  try {
    return await wcFetch<WooCategory[]>(
      '/products/categories',
      {
        per_page: params.per_page ?? 20,
        hide_empty: params.hide_empty ?? true,
        orderby: params.orderby ?? 'count',
        order: params.order ?? 'desc',
        parent: params.parent,
        search: params.search,
        lang: params.lang,
      },
      300
    );
  } catch {
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getCategoryBySlug(slug: string): Promise<WooCategory | null> {
  if (!isConfigured()) return null;
  try {
    const decoded = decodeSlug(slug);
    const result = await wcFetch<WooCategory[]>(
      '/products/categories',
      { slug: decoded, hide_empty: false },
      300
    );
    return result.data[0] ?? null;
  } catch {
    return null;
  }
}

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

export function parseSortOption(sort: string | undefined): Pick<WooProductsParams, 'orderby' | 'order'> {
  switch (sort) {
    case 'price_low':
      return { orderby: 'price', order: 'asc' };
    case 'price_high':
      return { orderby: 'price', order: 'desc' };
    case 'popular':
      return { orderby: 'popularity', order: 'desc' };
    case 'latest':
    default:
      return { orderby: 'date', order: 'desc' };
  }
}

export function formatPrice(price: string, currencySymbol?: string): string {
  if (!price) return '';
  const symbol = currencySymbol ?? process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '';
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${symbol} ${formatted}` : formatted;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
