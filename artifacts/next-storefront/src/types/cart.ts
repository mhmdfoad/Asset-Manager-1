import type { StockStatus } from './woocommerce';

export interface CartItem {
  product_id: number;
  variation_id?: number;
  slug: string;
  name: string;
  image?: string;
  selected_attributes?: Record<string, string>;
  quantity: number;
  /** Display only — never trust this value for checkout pricing */
  price_for_display: string;
  regular_price_for_display?: string;
  sale_price_for_display?: string;
  stock_status?: StockStatus;
  max_quantity?: number;
}

/** Stable key for a cart item (product + variation combo) */
export function cartItemKey(
  item: Pick<CartItem, 'product_id' | 'variation_id'>
): string {
  return `${item.product_id}-${item.variation_id ?? 0}`;
}
