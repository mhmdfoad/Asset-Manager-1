import 'server-only';
import { wcFetch } from './woocommerce';
import type { WooProduct, WooProductVariation } from '@/types/woocommerce';
import { validateCoupon, type ValidatedCoupon } from './coupons';

/* ------------------------------------------------------------------ */
/* Public types                                                         */
/* ------------------------------------------------------------------ */

export interface CartTotalsItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  name: string;
  price: number;
  line_total: number;
  virtual: boolean;
  downloadable: boolean;
}

export interface CartTotalsResult {
  items: CartTotalsItem[];
  subtotal: number;
  coupon: ValidatedCoupon | null;
  discount: number;
  shipping: number;
  /**
   * Estimated total — for display only.
   * WooCommerce is the authoritative source of truth upon order creation.
   */
  estimated_total: number;
  needs_shipping: boolean;
}

export type CartTotalsCalcResult =
  | { success: true; totals: CartTotalsResult }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/* calculateCartTotals                                                  */
/* ------------------------------------------------------------------ */

interface CartInput {
  items: Array<{
    product_id: number;
    variation_id?: number;
    quantity: number;
  }>;
  couponCode?: string;
  shippingCost?: number;
}

/**
 * Server-side cart totals calculation.
 *
 * Fetches product/variation prices directly from WooCommerce — client-supplied
 * prices are never trusted. Returns a preview total for display only.
 * WooCommerce recalculates everything authoritatively during order creation.
 */
export async function calculateCartTotals(input: CartInput): Promise<CartTotalsCalcResult> {
  if (!input.items.length) {
    return { success: false, error: 'Cart is empty.' };
  }

  // Fetch all unique products in one request
  const uniqueProductIds = [...new Set(input.items.map((i) => i.product_id))];
  let products: WooProduct[];
  try {
    const res = await wcFetch<WooProduct[]>(
      '/products',
      { include: uniqueProductIds.join(','), per_page: 100 },
      0 // no cache — cart must always see current prices
    );
    products = res.data;
  } catch {
    return { success: false, error: 'Failed to fetch product data.' };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Fetch variations in parallel
  const variationMap = new Map<string, WooProductVariation>();
  await Promise.all(
    input.items
      .filter((i) => i.variation_id && i.variation_id > 0)
      .map(async (item) => {
        try {
          const res = await wcFetch<WooProductVariation>(
            `/products/${item.product_id}/variations/${item.variation_id}`,
            {},
            0
          );
          variationMap.set(`${item.product_id}_${item.variation_id}`, res.data);
        } catch {
          // Variation fetch failure handled below
        }
      })
  );

  // Build calculated items
  const calcItems: CartTotalsItem[] = [];
  let subtotal = 0;
  let needsShipping = false;

  for (const item of input.items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return { success: false, error: `Product #${item.product_id} not found.` };
    }

    // virtual/downloadable may not be in the TS type but WC does return them
    const virtual = (product as unknown as Record<string, boolean>).virtual ?? false;
    const downloadable = (product as unknown as Record<string, boolean>).downloadable ?? false;

    let price = parseFloat(product.price || '0');

    if (item.variation_id && item.variation_id > 0) {
      const variation = variationMap.get(`${item.product_id}_${item.variation_id}`);
      if (!variation) {
        return { success: false, error: `Variation #${item.variation_id} not found.` };
      }
      price = parseFloat(variation.price || '0');
    }

    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    if (!virtual && !downloadable) {
      needsShipping = true;
    }

    calcItems.push({
      product_id: item.product_id,
      variation_id: item.variation_id,
      quantity: item.quantity,
      name: product.name,
      price,
      line_total: lineTotal,
      virtual,
      downloadable,
    });
  }

  // Validate coupon if provided
  let coupon: ValidatedCoupon | null = null;
  let discount = 0;
  if (input.couponCode?.trim()) {
    const couponRes = await validateCoupon(input.couponCode.trim(), subtotal);
    if (couponRes.success) {
      coupon = couponRes.coupon;
      discount = coupon.calculated_discount;
    }
  }

  const shipping = input.shippingCost ?? 0;
  const estimated_total = Math.max(0, subtotal - discount) + shipping;

  return {
    success: true,
    totals: {
      items: calcItems,
      subtotal,
      coupon,
      discount,
      shipping,
      estimated_total,
      needs_shipping: needsShipping,
    },
  };
}
