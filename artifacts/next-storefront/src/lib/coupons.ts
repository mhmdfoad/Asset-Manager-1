import 'server-only';
import { wcFetch, WooCommerceConfigError } from './woocommerce';

/* ------------------------------------------------------------------ */
/* WooCommerce Coupon shape (REST API response)                        */
/* ------------------------------------------------------------------ */

interface WooCoupon {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: string;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number | null;
  minimum_amount: string;
  maximum_amount: string;
  description: string;
  free_shipping: boolean;
}

/* ------------------------------------------------------------------ */
/* Public types                                                         */
/* ------------------------------------------------------------------ */

export interface ValidatedCoupon {
  code: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: string;
  minimum_amount: string;
  free_shipping: boolean;
  description: string;
  /** Calculated discount for the given subtotal — display only. WooCommerce is authoritative on order. */
  calculated_discount: number;
}

export type CouponErrorType =
  | 'not_found'
  | 'expired'
  | 'usage_limit'
  | 'minimum_amount'
  | 'maximum_amount'
  | 'api_error';

export type CouponResult =
  | { success: true; coupon: ValidatedCoupon }
  | { success: false; error: CouponErrorType; message: string };

/* ------------------------------------------------------------------ */
/* validateCoupon                                                       */
/* ------------------------------------------------------------------ */

/**
 * Validates a coupon code server-side via WooCommerce REST API.
 * Returns either a validated coupon with calculated discount, or an error.
 *
 * @param code    - Raw coupon code (will be trimmed + lowercased)
 * @param subtotal - Cart subtotal for minimum/maximum checks and discount calculation
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const sanitized = code.trim().toLowerCase();
  if (!sanitized) {
    return { success: false, error: 'not_found', message: 'Coupon code is empty.' };
  }

  try {
    const result = await wcFetch<WooCoupon[]>('/coupons', { code: sanitized }, 0);

    if (!result.data || result.data.length === 0) {
      return { success: false, error: 'not_found', message: 'Coupon not found.' };
    }

    const coupon = result.data[0];

    // Expiry check
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return { success: false, error: 'expired', message: 'This coupon has expired.' };
    }

    // Usage limit check
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return { success: false, error: 'usage_limit', message: 'Coupon usage limit has been reached.' };
    }

    // Minimum order amount check
    const minAmount = parseFloat(coupon.minimum_amount || '0');
    if (minAmount > 0 && subtotal < minAmount) {
      return {
        success: false,
        error: 'minimum_amount',
        message: `Minimum order amount for this coupon is ${coupon.minimum_amount}.`,
      };
    }

    // Maximum order amount check
    const maxAmount = parseFloat(coupon.maximum_amount || '0');
    if (maxAmount > 0 && subtotal > maxAmount) {
      return {
        success: false,
        error: 'maximum_amount',
        message: `Maximum order amount for this coupon is ${coupon.maximum_amount}.`,
      };
    }

    // Calculate discount amount
    const couponAmount = parseFloat(coupon.amount || '0');
    let calculated_discount = 0;
    if (coupon.discount_type === 'percent') {
      calculated_discount = (subtotal * couponAmount) / 100;
    } else {
      // fixed_cart or fixed_product — cap at subtotal
      calculated_discount = Math.min(couponAmount, subtotal);
    }

    return {
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        amount: coupon.amount,
        minimum_amount: coupon.minimum_amount,
        free_shipping: coupon.free_shipping,
        description: coupon.description,
        calculated_discount,
      },
    };
  } catch (err) {
    if (err instanceof WooCommerceConfigError) throw err;
    return { success: false, error: 'api_error', message: 'Failed to validate coupon.' };
  }
}
