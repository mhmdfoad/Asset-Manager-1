'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { X, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/store/toast-store';
import { formatPrice, decodeSlug } from '@/lib/format';
import QuantitySelector from './QuantitySelector';
import { cartItemKey } from '@/types/cart';

export default function CartDrawer({ locale }: { locale: string }) {
  const isAr = locale === 'ar';

  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalCount,
    getSubtotal,
  } = useCartStore();

  const count = getTotalCount();
  const subtotal = getSubtotal();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleRemove = (productId: number, variationId: number | undefined, name: string) => {
    removeItem(productId, variationId);
    toast(
      isAr ? `تم حذف "${name}" من السلة` : `"${name}" removed from cart`,
      'info'
    );
  };

  const handleClear = () => {
    clearCart();
    toast(isAr ? 'تم تفريغ السلة' : 'Cart cleared', 'info');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'سلة التسوق' : 'Shopping Cart'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent-500" />
            <h2 className="text-lg font-bold text-primary-800">
              {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            </h2>
            {count > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingCart className="h-9 w-9 text-neutral-300" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-800">
                {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {isAr ? 'أضف منتجات لتبدأ التسوق' : 'Add items to start shopping'}
              </p>
            </div>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-400"
            >
              {isAr ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const key = cartItemKey(item);
                  const displayPrice = item.sale_price_for_display || item.price_for_display;
                  const hasSale =
                    item.sale_price_for_display && item.regular_price_for_display;

                  return (
                    <div
                      key={key}
                      className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3"
                    >
                      {/* Image */}
                      <Link
                        href={`/product/${decodeSlug(item.slug)}`}
                        onClick={closeDrawer}
                        className="flex-shrink-0"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
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
                              <ShoppingBag className="h-6 w-6 text-neutral-300" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Link
                          href={`/product/${decodeSlug(item.slug)}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-primary-800 transition-colors hover:text-accent-600"
                        >
                          {item.name}
                        </Link>

                        {/* Selected attributes */}
                        {item.selected_attributes &&
                          Object.keys(item.selected_attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.selected_attributes).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-600"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-accent-600">
                            {formatPrice(displayPrice)}
                          </span>
                          {hasSale && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(item.regular_price_for_display!)}
                            </span>
                          )}
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center justify-between">
                          <QuantitySelector
                            quantity={item.quantity}
                            max={item.max_quantity}
                            onChange={(qty) =>
                              updateQuantity(item.product_id, qty, item.variation_id)
                            }
                            locale={locale}
                            size="sm"
                          />
                          <button
                            onClick={() =>
                              handleRemove(item.product_id, item.variation_id, item.name)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label={isAr ? 'حذف' : 'Remove'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {items.length > 1 && (
                <button
                  onClick={handleClear}
                  className="mt-4 w-full text-center text-xs text-neutral-400 transition-colors hover:text-red-500"
                >
                  {isAr ? 'تفريغ السلة' : 'Clear cart'}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 bg-white px-5 py-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                  {isAr ? 'المجموع الجزئي' : 'Subtotal'}
                </span>
                <span className="text-lg font-bold text-primary-800">
                  {formatPrice(subtotal.toFixed(2))}
                </span>
              </div>
              <p className="mb-4 text-xs text-neutral-400">
                {isAr
                  ? 'الشحن والضرائب تُحسب عند الدفع'
                  : 'Shipping & taxes calculated at checkout'}
              </p>

              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl"
                >
                  {isAr ? 'إتمام الشراء' : 'Checkout'}
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-primary-800 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600"
                >
                  {isAr ? 'عرض السلة' : 'View Cart'}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
