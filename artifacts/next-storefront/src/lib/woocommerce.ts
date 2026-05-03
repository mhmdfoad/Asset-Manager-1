import 'server-only';

export class WooCommerceConfigError extends Error {
  constructor() {
    super(
      'WooCommerce environment variables are not configured. ' +
        'Please set WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET.'
    );
    this.name = 'WooCommerceConfigError';
  }
}

export class WooCommerceApiError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(`WooCommerce API error ${status}: ${message}`);
    this.status = status;
    this.name = 'WooCommerceApiError';
  }
}

function getConfig() {
  const storeUrl = process.env.WOOCOMMERCE_STORE_URL?.trim().replace(/\/$/, '');
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

  if (!storeUrl || !consumerKey || !consumerSecret) {
    throw new WooCommerceConfigError();
  }

  return { storeUrl, consumerKey, consumerSecret };
}

export interface WcFetchResult<T> {
  data: T;
  total: number;
  totalPages: number;
}

export async function wcFetch<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  revalidate = 60
): Promise<WcFetchResult<T>> {
  const { storeUrl, consumerKey, consumerSecret } = getConfig();

  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    }
  }

  const qs = searchParams.toString();
  const url = `${storeUrl}/wp-json/wc/v3${endpoint}${qs ? `?${qs}` : ''}`;

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new WooCommerceApiError(response.status, body);
  }

  const data = (await response.json()) as T;
  const total = parseInt(response.headers.get('X-WP-Total') ?? '0', 10);
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') ?? '1', 10);

  return { data, total, totalPages };
}

/**
 * POST request to WooCommerce REST API.
 * Use for mutations (creating orders, etc.). Never cached.
 */
export async function wcPost<T>(endpoint: string, body: unknown): Promise<T> {
  const { storeUrl, consumerKey, consumerSecret } = getConfig();
  const url = `${storeUrl}/wp-json/wc/v3${endpoint}`;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new WooCommerceApiError(response.status, text);
  }

  return (await response.json()) as T;
}

export function isConfigured(): boolean {
  return !!(
    process.env.WOOCOMMERCE_STORE_URL &&
    process.env.WOOCOMMERCE_CONSUMER_KEY &&
    process.env.WOOCOMMERCE_CONSUMER_SECRET
  );
}
