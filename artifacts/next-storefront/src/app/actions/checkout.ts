'use server';

import { createWooCommerceOrder, parseWooError } from '@/lib/orders';
import { ServerCheckoutSchema } from '@/lib/validations/checkout';
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
 */
export async function createOrderAction(rawInput: unknown): Promise<CreateOrderResult> {
  // Validate with strict server-side schema
  const parsed = ServerCheckoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? 'Invalid checkout data.' };
  }

  const { cartItems, billing, shipping, couponCode, customerNote, paymentMethod } = parsed.data;

  const paymentMethodTitle =
    paymentMethod === 'cod'
      ? 'Cash on Delivery'
      : paymentMethod === 'bacs'
        ? 'Direct Bank Transfer'
        : paymentMethod === 'cheque'
          ? 'Check Payments'
          : paymentMethod;

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
    console.error('[createOrderAction]', error);

    if (error instanceof WooCommerceConfigError) {
      return { success: false, error: 'Store is not configured. Please contact support.' };
    }

    return { success: false, error: parseWooError(error) };
  }
}
