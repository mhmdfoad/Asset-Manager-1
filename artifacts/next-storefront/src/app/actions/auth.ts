'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'hwauth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, matches WordPress token expiry

function wpBase(): string {
  const url = process.env.WOOCOMMERCE_STORE_URL?.trim().replace(/\/$/, '');
  if (!url) throw new Error('WOOCOMMERCE_STORE_URL is not configured.');
  return `${url}/wp-json/headless-auth/v1`;
}

async function setAuthCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
  };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginAction(_: unknown, formData: FormData): Promise<AuthActionResult> {
  const identifier = (formData.get('username_or_email') as string)?.trim() ?? '';
  const password = (formData.get('password') as string) ?? '';

  if (!identifier || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const res = await fetch(`${wpBase()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email: identifier, password }),
      cache: 'no-store',
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json?.message ?? 'Login failed.' };
    }

    await setAuthCookie(json.token);
    return { success: true, user: json.user };
  } catch {
    return { success: false, error: 'Connection error. Please try again.' };
  }
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerAction(_: unknown, formData: FormData): Promise<AuthActionResult> {
  const first_name = (formData.get('first_name') as string)?.trim() ?? '';
  const last_name = (formData.get('last_name') as string)?.trim() ?? '';
  const email = (formData.get('email') as string)?.trim() ?? '';
  const password = (formData.get('password') as string) ?? '';
  const confirm_password = (formData.get('confirm_password') as string) ?? '';
  const phone = (formData.get('phone') as string)?.trim() ?? '';

  if (!first_name || !last_name || !email || !password) {
    return { success: false, error: 'All required fields must be filled.' };
  }
  if (password !== confirm_password) {
    return { success: false, error: 'Passwords do not match.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  try {
    const res = await fetch(`${wpBase()}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, email, password, phone }),
      cache: 'no-store',
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json?.message ?? 'Registration failed.' };
    }

    await setAuthCookie(json.token);
    return { success: true, user: json.user };
  } catch {
    return { success: false, error: 'Connection error. Please try again.' };
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// ── Profile update ────────────────────────────────────────────────────────────

export async function updateProfileAction(
  _: unknown,
  formData: FormData
): Promise<AuthActionResult> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return { success: false, error: 'Not authenticated.' };

  const data: Record<string, string> = {};
  for (const key of ['first_name', 'last_name', 'display_name', 'billing_phone']) {
    const val = formData.get(key) as string | null;
    if (val !== null) data[key] = val.trim();
  }

  try {
    const res = await fetch(`${wpBase()}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json?.message ?? 'Update failed.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Connection error.' };
  }
}

// ── Address update ────────────────────────────────────────────────────────────

export async function updateAddressAction(
  _: unknown,
  formData: FormData
): Promise<AuthActionResult> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return { success: false, error: 'Not authenticated.' };

  const addressFields = [
    'billing_first_name', 'billing_last_name', 'billing_company',
    'billing_email', 'billing_phone',
    'billing_country', 'billing_state', 'billing_city',
    'billing_address_1', 'billing_address_2', 'billing_postcode',
    'shipping_first_name', 'shipping_last_name', 'shipping_company',
    'shipping_country', 'shipping_state', 'shipping_city',
    'shipping_address_1', 'shipping_address_2', 'shipping_postcode',
  ];

  const data: Record<string, string> = {};
  for (const key of addressFields) {
    const val = formData.get(key) as string | null;
    if (val !== null) data[key] = val;
  }

  try {
    const res = await fetch(`${wpBase()}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json?.message ?? 'Update failed.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Connection error.' };
  }
}
