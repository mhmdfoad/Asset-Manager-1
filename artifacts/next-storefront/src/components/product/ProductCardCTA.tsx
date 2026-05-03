'use client';

import { ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/store/toast-store';
import { decodeSlug } from '@/lib/format';
import type { CartItem } from '@/types/cart';
import type { StockStatus } from '@/types/woocommerce';

interface ProductCardCTAProps {
  productId: number;
  productType: string;
  stockStatus: StockStatus;
  slug: string;
  name: string;
  image?: string;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  locale: string;
}

export default function ProductCardCTA({
  productId,
  productType,
  stockStatus,
  slug,
  name,
  image,
  price,
  regularPrice,
  salePrice,
  onSale,
  locale,
}: ProductCardCTAProps) {
  const isAr = locale === 'ar';
  const isOutOfStock = stockStatus === 'outofstock';
  const isVariable = productType === 'variable';
  const { addItem, openDrawer } = useCartStore();

  if (isOutOfStock) {
    return (
      <div className="flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-400">
        {isAr ? 'نفد من المخزون' : 'Out of Stock'}
      </div>
    );
  }

  if (isVariable) {
    return (
      <Link
        href={`/product/${decodeSlug(slug)}`}
        className="flex w-full items-center justify-center rounded-full border border-accent-400 bg-white px-4 py-2 text-xs font-semibold text-accent-600 transition-colors hover:bg-accent-50"
        onClick={(e) => e.stopPropagation()}
      >
        {isAr ? 'اختر الخيارات' : 'Choose Options'}
      </Link>
    );
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const item: CartItem = {
      product_id: productId,
      slug,
      name,
      image,
      quantity: 1,
      price_for_display: price,
      regular_price_for_display: regularPrice,
      sale_price_for_display: onSale ? salePrice : undefined,
      stock_status: stockStatus,
    };

    addItem(item);
    openDrawer();
    toast(
      isAr ? `تمت إضافة "${name}" إلى السلة` : `"${name}" added to cart`,
      'success'
    );
  };

  return (
    <button
      onClick={handleAdd}
      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-400"
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
    </button>
  );
}
