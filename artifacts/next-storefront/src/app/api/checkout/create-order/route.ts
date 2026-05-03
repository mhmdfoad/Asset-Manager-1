import { NextRequest, NextResponse } from 'next/server';
import { ServerCheckoutSchema } from '@/lib/validations/checkout';
import { createWooCommerceOrder, parseWooError } from '@/lib/orders';
import { WooCommerceConfigError, WooCommerceApiError } from '@/lib/woocommerce';

/* ------------------------------------------------------------------ */
/* Basic in-memory rate limiter (resets on server restart)            */
/* ------------------------------------------------------------------ */
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60_000; // 1 minute

const ipMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

/* ------------------------------------------------------------------ */
/* POST /api/checkout/create-order                                     */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  // Parse body
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Validate with server-side Zod schema
  const parsed = ServerCheckoutSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message ?? 'Invalid checkout data.', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { cartItems, billing, shipping, couponCode, customerNote, paymentMethod } = parsed.data;

  // Determine payment method title
  const paymentMethodTitle =
    paymentMethod === 'cod'
      ? 'Cash on Delivery'
      : paymentMethod === 'bacs'
      ? 'Direct Bank Transfer'
      : paymentMethod === 'cheque'
      ? 'Check Payments'
      : paymentMethod;

  // Build order input (no prices from client — WooCommerce calculates everything)
  const orderInput = {
    billing: {
      ...billing,
      email: billing.email,
      phone: billing.phone,
    },
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
  };

  try {
    const result = await createWooCommerceOrder(orderInput);

    return NextResponse.json(
      {
        order_id: result.order_id,
        order_number: result.order.number,
        payment_url: result.payment_url,
        status: result.order.status,
        total: result.order.total,
        currency: result.order.currency,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[checkout/create-order]', error);

    if (error instanceof WooCommerceConfigError) {
      return NextResponse.json(
        { error: 'Store is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    if (error instanceof WooCommerceApiError) {
      // Try to extract a readable message from WooCommerce error body
      const wcMessage = parseWooError(error);

      // Map common WC error codes to user-friendly messages
      if (error.status === 400) {
        return NextResponse.json({ error: wcMessage }, { status: 400 });
      }
      if (error.status === 404) {
        return NextResponse.json(
          { error: 'One or more products could not be found. Please update your cart.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: wcMessage }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
