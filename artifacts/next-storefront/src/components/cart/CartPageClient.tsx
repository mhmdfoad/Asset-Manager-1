'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/store/toast-store';
import { formatPrice, decodeSlug } from '@/lib/format';
import QuantitySelector from '@/components/cart/QuantitySelector';
import { cartItemKey } from '@/types/cart';

interface CartPageClientProps {
  locale: string;
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { items, removeItem, updateQuantity, clearCart, getTotalCount, getSubtotal } =
    useCartStore();

  const subtotal = mounted ? getSubtotal() : 0;
  const count = mounted ? getTotalCount() : 0;

  const handleRemove = (productId: number, variationId: number | undefined, name: string) => {
    removeItem(productId, variationId);
    toast(isAr ? `تم حذف "${name}" من السلة` : `"${name}" removed from cart`, 'info');
  };

  const handleClear = () => {
    clearCart();
    toast(isAr ? 'تم تفريغ السلة' : 'Cart cleared', 'info');
  };

  if (!mounted) {
    return (
      <div className="container flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingCart className="h-10 w-10 text-neutral-300" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-primary-800">
          {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
        </h2>
        <p className="mt-2 text-neutral-500">
          {isAr
            ? 'أضف منتجات إلى سلتك لتبدأ التسوق'
            : 'Add items to your cart to start shopping'}
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-accent-400"
        >
          {isAr ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Page title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-800">
            {isAr ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {count} {isAr ? 'منتج' : count === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="text-sm text-neutral-400 transition-colors hover:text-red-500"
        >
          {isAr ? 'تفريغ السلة' : 'Clear cart'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items column */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {/* Table head */}
            <div className="hidden grid-cols-12 gap-4 bg-neutral-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:grid">
              <div className="col-span-6">{isAr ? 'المنتج' : 'Product'}</div>
              <div className="col-span-2 text-center">{isAr ? 'السعر' : 'Price'}</div>
              <div className="col-span-2 text-center">{isAr ? 'الكمية' : 'Qty'}</div>
              <div className="col-span-2 text-end">{isAr ? 'الإجمالي' : 'Total'}</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-neutral-100">
              {items.map((item) => {
                const key = cartItemKey(item);
                const displayPrice =
                  item.sale_price_for_display || item.price_for_display;
                const hasSale =
                  item.sale_price_for_display && item.regular_price_for_display;
                const lineTotal =
                  parseFloat(item.price_for_display || '0') * item.quantity;

                return (
                  <div
                    key={key}
                    className="grid grid-cols-12 items-center gap-4 px-6 py-5"
                  >
                    {/* Product */}
                    <div className="col-span-12 flex gap-4 sm:col-span-6">
                      <Link
                        href={`/product/${decodeSlug(item.slug)}`}
                        className="flex-shrink-0"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-neutral-300" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex min-w-0 flex-col gap-1">
                        <Link
                          href={`/product/${decodeSlug(item.slug)}`}
                          className="line-clamp-2 text-sm font-semibold text-primary-800 transition-colors hover:text-accent-600"
                        >
                          {item.name}
                        </Link>
                        {item.selected_attributes &&
                          Object.keys(item.selected_attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.selected_attributes).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600"
                                >
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        <button
                          onClick={() =>
                            handleRemove(item.product_id, item.variation_id, item.name)
                          }
                          className="mt-0.5 flex items-center gap-1 self-start text-xs text-neutral-400 transition-colors hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                          {isAr ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-4 sm:col-span-2 sm:text-center">
                      <div className="text-sm font-semibold text-accent-600">
                        {formatPrice(displayPrice)}
                      </div>
                      {hasSale && (
                        <div className="text-xs text-neutral-400 line-through">
                          {formatPrice(item.regular_price_for_display!)}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-5 flex justify-start sm:col-span-2 sm:justify-center">
                      <QuantitySelector
                        quantity={item.quantity}
                        max={item.max_quantity}
                        onChange={(qty) =>
                          updateQuantity(item.product_id, qty, item.variation_id)
                        }
                        locale={locale}
                        size="sm"
                      />
                    </div>

                    {/* Line total */}
                    <div className="col-span-3 text-end sm:col-span-2">
                      <span className="text-sm font-bold text-primary-800">
                        {formatPrice(lineTotal.toFixed(2))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue shopping */}
          <div className="mt-5">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-600 transition-colors hover:text-accent-500"
            >
              {isAr ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-bold text-primary-800">
            {isAr ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'المجموع الجزئي' : 'Subtotal'}</span>
              <span className="font-semibold text-primary-800">
                {formatPrice(subtotal.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'الشحن' : 'Shipping'}</span>
              <span className="text-neutral-400">
                {isAr ? 'يُحسب عند الدفع' : 'Calculated at checkout'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{isAr ? 'الضريبة' : 'Tax'}</span>
              <span className="text-neutral-400">{isAr ? 'قد تنطبق' : 'May apply'}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-primary-800">
              {isAr ? 'الإجمالي' : 'Total'}
            </span>
            <span className="text-xl font-bold text-accent-600">
              {formatPrice(subtotal.toFixed(2))}
            </span>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            {isAr
              ? '* الأسعار للعرض فقط. السعر النهائي يُحسب عند إتمام الطلب.'
              : '* Prices shown for display only. Final price calculated at checkout.'}
          </p>

          <Link
            href="/checkout"
            className="mt-5 flex items-center justify-center rounded-full bg-accent-500 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
          >
            {isAr ? 'إتمام الشراء' : 'Proceed to Checkout'}
          </Link>
        </div>
      </div>
    </div>
  );
}
