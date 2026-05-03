'use server';

import { z } from 'zod';
import { validateCoupon } from '@/lib/coupons';
import { getShippingMethods, type ShippingMethodResult } from '@/lib/shipping';
import { WooCommerceConfigError } from '@/lib/woocommerce';
import type { ValidatedCoupon } from '@/lib/coupons';

/* ------------------------------------------------------------------ */
/* Coupon validation action                                             */
/* ------------------------------------------------------------------ */

export type CouponActionResult =
  | { success: true; coupon: ValidatedCoupon }
  | { success: false; error: string };

/**
 * Server Action — validates a coupon code against WooCommerce.
 * Called directly from client components (no API route needed).
 */
export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<CouponActionResult> {
  const codeVal = z.string().max(100).safeParse(code.trim());
  const subtotalVal = z.number().min(0).safeParse(subtotal);

  if (!codeVal.success || !subtotalVal.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const result = await validateCoupon(codeVal.data, subtotalVal.data);
    if (!result.success) {
      return { success: false, error: result.message };
    }
    return { success: true, coupon: result.coupon };
  } catch (err) {
    if (err instanceof WooCommerceConfigError) {
      return { success: false, error: 'Store is not configured.' };
    }
    return { success: false, error: 'Failed to validate coupon. Please try again.' };
  }
}

/* ------------------------------------------------------------------ */
/* Shipping methods action                                              */
/* ------------------------------------------------------------------ */

export type ShippingMethodsActionResult =
  | { success: true; methods: ShippingMethodResult[] }
  | { success: false; error: string };

/**
 * Server Action — fetches available shipping methods from WooCommerce for a country/state.
 * Called directly from client components when billing/shipping address changes.
 */
export async function getShippingMethodsAction(
  country: string,
  state?: string,
  subtotal?: number,
  hasCoupon?: boolean
): Promise<ShippingMethodsActionResult> {
  const schema = z.object({
    country: z.string().min(1).max(10),
    state: z.string().max(100).optional(),
    subtotal: z.number().min(0).optional(),
    hasCoupon: z.boolean().optional(),
  });

  const parsed = schema.safeParse({ country, state, subtotal, hasCoupon });
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const methods = await getShippingMethods(
      parsed.data.country,
      parsed.data.state,
      parsed.data.subtotal,
      parsed.data.hasCoupon
    );
    return { success: true, methods };
  } catch (err) {
    if (err instanceof WooCommerceConfigError) {
      return { success: false, error: 'Store is not configured.' };
    }
    return { success: false, error: 'Failed to fetch shipping methods.' };
  }
}
