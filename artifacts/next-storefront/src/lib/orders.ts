import 'server-only';
import { wcPost, WooCommerceApiError } from './woocommerce';

export interface OrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country: string;
}

export interface OrderLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

export interface CreateOrderInput {
  billing: OrderAddress;
  shipping: OrderAddress;
  line_items: OrderLineItem[];
  coupon_lines?: { code: string }[];
  customer_note?: string;
  payment_method?: string;
  payment_method_title?: string;
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: string;
  subtotal: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  order_key: string;
  payment_url: string;
  currency: string;
  currency_symbol: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  billing: OrderAddress;
  shipping: Omit<OrderAddress, 'email' | 'phone'>;
  line_items: WooOrderLineItem[];
  coupon_lines: { id: number; code: string; discount: string }[];
}

export interface CreateOrderResult {
  order: WooOrder;
  payment_url: string | null;
  order_id: number;
}

/**
 * Creates a WooCommerce order server-side.
 * Prices, taxes, and totals are NEVER accepted from the client —
 * WooCommerce calculates everything from product IDs.
 */
export async function createWooCommerceOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const payload = {
    payment_method: input.payment_method ?? 'cod',
    payment_method_title: input.payment_method_title ?? 'Cash on Delivery',
    set_paid: false,
    status: 'pending',
    billing: sanitizeAddress(input.billing),
    shipping: sanitizeAddress(input.shipping),
    line_items: input.line_items.map((item) => ({
      product_id: item.product_id,
      ...(item.variation_id && item.variation_id > 0 ? { variation_id: item.variation_id } : {}),
      quantity: item.quantity,
      // IMPORTANT: No price fields — WooCommerce calculates from product ID
    })),
    ...(input.coupon_lines && input.coupon_lines.length > 0
      ? { coupon_lines: input.coupon_lines }
      : {}),
    ...(input.customer_note ? { customer_note: input.customer_note } : {}),
  };

  const order = await wcPost<WooOrder>('/orders', payload);

  // payment_url is present for gateway orders; for COD it points to order-received page
  const payment_url = order.payment_url ?? null;

  return { order, payment_url, order_id: order.id };
}

/** Strip any untrusted or empty fields before sending to WooCommerce */
function sanitizeAddress(addr: OrderAddress): OrderAddress {
  return {
    first_name: addr.first_name.trim(),
    last_name: addr.last_name.trim(),
    ...(addr.company?.trim() ? { company: addr.company.trim() } : {}),
    ...(addr.email?.trim() ? { email: addr.email.trim() } : {}),
    ...(addr.phone?.trim() ? { phone: addr.phone.trim() } : {}),
    address_1: addr.address_1.trim(),
    ...(addr.address_2?.trim() ? { address_2: addr.address_2.trim() } : {}),
    city: addr.city.trim(),
    ...(addr.state?.trim() ? { state: addr.state.trim() } : {}),
    ...(addr.postcode?.trim() ? { postcode: addr.postcode.trim() } : {}),
    country: addr.country.trim().toUpperCase(),
  };
}

/** Parse a WooCommerce API error body into a user-readable message */
export function parseWooError(error: unknown): string {
  if (error instanceof WooCommerceApiError) {
    try {
      const parsed = JSON.parse(error.message.replace(/^WooCommerce API error \d+: /, ''));
      if (parsed?.message) return parsed.message;
      if (parsed?.data?.details) {
        const details = Object.values(parsed.data.details) as string[];
        return details[0] ?? parsed.message;
      }
    } catch {}
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
