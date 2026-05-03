'use server';

import { createWooCommerceOrder, parseWooError } from '@/lib/orders';
import { ServerCheckoutSchema } from '@/lib/validations/checkout';
import { getShippingMethods } from '@/lib/shipping';
import { WooCommerceConfigError } from '@/lib/woocommerce';

export type CreateOrderResult =
  | { success: true; order_id: number; order_number: string; payment_url: string | null }
  | { success: false; error: string };

/**
 * Server Action — creates a WooCommerce order server-side.
 *
 * Called directly from CheckoutForm (client component).
 * No API route needed — bypasses the /api proxy routing conflict.
 * Prices are NEVER accepted from the client; WooCommerce calculates totals.
 *
 * When shippingMethodId + shippingCountry are provided, the server re-fetches
 * shipping methods from WooCommerce and resolves the cost server-side.
 * Client-supplied costs are never trusted.
 */
export async function createOrderAction(rawInput: unknown): Promise<CreateOrderResult> {
  // Validate with strict server-side schema
  const parsed = ServerCheckoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? 'Invalid checkout data.' };
  }

  const {
    cartItems,
    billing,
    shipping,
    couponCode,
    customerNote,
    paymentMethod,
    shippingMethodId,
    shippingCountry,
    shippingState,
  } = parsed.data;

  const paymentMethodTitle =
    paymentMethod === 'cod'
      ? 'Cash on Delivery'
      : paymentMethod === 'bacs'
        ? 'Direct Bank Transfer'
        : paymentMethod === 'cheque'
          ? 'Check Payments'
          : paymentMethod;

  // NOTE: We intentionally do NOT attach customer_id to WooCommerce orders.
  // When customer_id is set, WooCommerce's order-pay page requires that exact
  // WordPress user to be logged in — but our headless auth does not create a
  // WordPress session, so payment would be rejected with "Payment for this order
  // is not possible." WooCommerce already associates orders to accounts by
  // matching billing email, so account order history still works correctly.

  // Resolve shipping method server-side when the customer selected one.
  // We re-fetch methods from WooCommerce so the cost is always authoritative.
  const shippingLines: { method_id: string; method_title: string; total: string }[] = [];

  if (shippingMethodId && shippingCountry) {
    try {
      const methods = await getShippingMethods(
        shippingCountry,
        shippingState,
        undefined,
        !!couponCode?.trim()
      );
      const selected = methods.find((m) => m.id === shippingMethodId);
      if (selected) {
        shippingLines.push({
          method_id: selected.method_id,
          method_title: selected.title,
          total: selected.cost.toFixed(2),
        });
      }
    } catch {
      // Shipping resolution failure should not block order creation —
      // WooCommerce will apply its default shipping calculation.
    }
  }

  try {
    const result = await createWooCommerceOrder({
      billing,
      shipping: shipping ?? billing,
      line_items: cartItems.map((item) => ({
        product_id: item.product_id,
        ...(item.variation_id && item.variation_id > 0
          ? { variation_id: item.variation_id }
          : {}),
        quantity: item.quantity,
      })),
      coupon_lines: couponCode?.trim() ? [{ code: couponCode.trim() }] : [],
      shipping_lines: shippingLines,
      customer_note: customerNote?.trim() ?? '',
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
    });

    return {
      success: true,
      order_id: result.order_id,
      order_number: result.order.number,
      payment_url: result.payment_url,
    };
  } catch (error) {
    if (error instanceof WooCommerceConfigError) {
      return { success: false, error: 'Store is not configured. Please contact support.' };
    }

    return { success: false, error: parseWooError(error) };
  }
}
