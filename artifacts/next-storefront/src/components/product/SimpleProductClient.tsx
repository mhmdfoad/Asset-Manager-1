'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/store/toast-store';
import QuantitySelector from '@/components/cart/QuantitySelector';
import type { WooProduct } from '@/types/woocommerce';
import type { CartItem } from '@/types/cart';

interface SimpleProductClientProps {
  product: WooProduct;
  locale: string;
}

export default function SimpleProductClient({ product, locale }: SimpleProductClientProps) {
  const isAr = locale === 'ar';
  const [quantity, setQuantity] = useState(1);
  const { addItem, openDrawer } = useCartStore();

  const isOutOfStock = product.stock_status === 'outofstock';
  const maxQty =
    product.manage_stock && product.stock_quantity ? product.stock_quantity : 999;

  const handleAddToCart = () => {
    const item: CartItem = {
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.src ?? undefined,
      quantity,
      price_for_display: product.price || product.regular_price,
      regular_price_for_display: product.regular_price || undefined,
      sale_price_for_display: product.on_sale ? (product.sale_price || undefined) : undefined,
      stock_status: product.stock_status,
      max_quantity: maxQty < 999 ? maxQty : undefined,
    };

    addItem(item);
    openDrawer();
    toast(
      isAr
        ? `تمت إضافة "${product.name}" إلى السلة`
        : `"${product.name}" added to cart`,
      'success'
    );
  };

  if (isOutOfStock) {
    return (
      <div className="flex items-center justify-center rounded-full bg-neutral-200 px-8 py-4 text-base font-semibold text-neutral-500 cursor-not-allowed select-none">
        {isAr ? 'نفد من المخزون' : 'Out of Stock'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <QuantitySelector
        quantity={quantity}
        min={1}
        max={maxQty}
        onChange={setQuantity}
        locale={locale}
      />
      <button
        type="button"
        onClick={handleAddToCart}
        className="flex flex-1 items-center justify-center gap-3 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
      >
        <ShoppingCart className="h-5 w-5" />
        {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
      </button>
    </div>
  );
}
