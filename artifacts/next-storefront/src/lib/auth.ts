import 'server-only';
import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'hwauth';

function wpAuthBase(): string {
  const url = process.env.WOOCOMMERCE_STORE_URL?.trim().replace(/\/$/, '');
  if (!url) throw new Error('WOOCOMMERCE_STORE_URL is not configured.');
  return `${url}/wp-json/headless-auth/v1`;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
}

export interface WpAddresses {
  billing_first_name?: string;
  billing_last_name?: string;
  billing_company?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_country?: string;
  billing_state?: string;
  billing_city?: string;
  billing_address_1?: string;
  billing_address_2?: string;
  billing_postcode?: string;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_company?: string;
  shipping_country?: string;
  shipping_state?: string;
  shipping_city?: string;
  shipping_address_1?: string;
  shipping_address_2?: string;
  shipping_postcode?: string;
}

export interface WpOrderSummary {
  id: number;
  number: string;
  status: string;
  total: number;
  currency: string;
  currency_symbol: string;
  payment_method_title: string;
  date_created: string;
  item_count: number;
}

export interface WpOrderDetail extends WpOrderSummary {
  subtotal: number;
  total_tax: number;
  shipping_total: number;
  discount_total: number;
  payment_method: string;
  customer_note: string;
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: number;
  }>;
  billing: {
    first_name: string;
    last_name: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
}

export interface WpProfile {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  billing_phone: string;
}

/** Read the raw token from the HTTP-only cookie (server-only). */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/** Fetch the current user from WordPress using the stored token. Returns null if not authenticated. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${wpAuthBase()}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

/** Generic authenticated GET to any headless-auth endpoint. */
export async function wpAuthGet<T>(path: string): Promise<T | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${wpAuthBase()}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Generic authenticated POST to any headless-auth endpoint. */
export async function wpAuthPost<T>(path: string, body: unknown): Promise<T | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${wpAuthBase()}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Build the WordPress headless-auth base URL (for use in server actions). */
export function getWpAuthBase(): string {
  return wpAuthBase();
}
