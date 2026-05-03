'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ShoppingBag, Info, Tag, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';
import { formatPrice } from '@/lib/format';
import { cartItemKey } from '@/types/cart';

interface OrderSummaryProps {
  locale: string;
}

export default function OrderSummary({ locale }: OrderSummaryProps) {
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, getSubtotal, getTotalCount } = useCartStore();
  const { appliedCoupon, selectedShippingMethod } = useCheckoutStore();

  const subtotal = mounted ? getSubtotal() : 0;
  const count = mounted ? getTotalCount() : 0;

  // Calculated totals
  const discount = mounted && appliedCoupon ? appliedCoupon.calculated_discount : 0;
  const shippingCost = mounted && selectedShippingMethod ? selectedShippingMethod.cost : null;
  const afterDiscount = Math.max(0, subtotal - discount);
  const estimatedTotal = afterDiscount + (shippingCost ?? 0);

  const l = isAr
    ? {
        title: 'ملخص الطلب',
        subtotal: 'المجموع الجزئي',
        discount: 'خصم الكوبون',
        shipping: 'الشحن',
        shippingFree: 'مجاني',
        shippingCalculated: 'يُحسب لاحقاً',
        tax: 'الضريبة',
        taxNote: 'قد تنطبق',
        total: 'الإجمالي المقدّر',
        empty: 'سلتك فارغة',
        browseProducts: 'تصفح المنتجات',
        disclaimer:
          'الإجمالي النهائي يشمل الشحن والضرائب ويُحسب بواسطة المتجر عند إتمام الطلب.',
      }
    : {
        title: 'Order Summary',
        subtotal: 'Subtotal',
        discount: 'Coupon Discount',
        shipping: 'Shipping',
        shippingFree: 'Free',
        shippingCalculated: 'Calculated by store',
        tax: 'Tax',
        taxNote: 'May apply',
        total: 'Est. Total',
        empty: 'Your cart is empty',
        browseProducts: 'Browse products',
        disclaimer:
          'Final total includes shipping & taxes, calculated by the store upon order creation.',
      };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="text-base font-bold text-primary-800">{l.title}</h2>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      </div>

      {/* Items list */}
      <div className="max-h-80 overflow-y-auto px-5 py-4">
        {!mounted ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-200 border-t-accent-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-400">
            <ShoppingBag className="h-8 w-8" />
            <p className="text-sm">{l.empty}</p>
            <Link
              href="/shop"
              className="mt-1 text-sm font-medium text-accent-600 hover:text-accent-500"
            >
              {l.browseProducts}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const key = cartItemKey(item);
              const displayPrice = item.sale_price_for_display || item.price_for_display;

              return (
                <div key={key} className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-neutral-300" />
                      </div>
                    )}
                    {/* Quantity badge */}
                    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-800 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="line-clamp-2 text-xs font-semibold text-primary-800">
                      {item.name}
                    </p>
                    {item.selected_attributes &&
                      Object.keys(item.selected_attributes).length > 0 && (
                        <p className="text-xs text-neutral-500">
                          {Object.values(item.selected_attributes).join(' · ')}
                        </p>
                      )}
                  </div>

                  {/* Unit price */}
                  <div className="flex-shrink-0 text-end">
                    <p className="text-xs font-bold text-accent-600">
                      {formatPrice(displayPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-neutral-100 px-5 py-4">
        <div className="flex flex-col gap-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{l.subtotal}</span>
            <span className="font-semibold text-primary-800">
              {formatPrice(subtotal.toFixed(2))}
            </span>
          </div>

          {/* Coupon discount — only shown when a coupon is applied */}
          {mounted && appliedCoupon && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-green-600">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-mono text-xs uppercase">{appliedCoupon.code}</span>
              </span>
              <span className="font-semibold text-green-600">
                − {formatPrice(discount.toFixed(2))}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-neutral-500">
              <Truck className="h-3.5 w-3.5" />
              {mounted && selectedShippingMethod
                ? selectedShippingMethod.title
                : l.shipping}
            </span>
            <span
              className={
                mounted && selectedShippingMethod
                  ? selectedShippingMethod.free
                    ? 'font-semibold text-green-600'
                    : 'font-semibold text-primary-800'
                  : 'text-neutral-400'
              }
            >
              {mounted && selectedShippingMethod
                ? selectedShippingMethod.free
                  ? l.shippingFree
                  : formatPrice(selectedShippingMethod.cost.toFixed(2))
                : l.shippingCalculated}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{l.tax}</span>
            <span className="text-neutral-400">{l.taxNote}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-3 border-t border-dashed border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-800">{l.total}</span>
            <span className="text-lg font-bold text-accent-600">
              {formatPrice(estimatedTotal.toFixed(2))}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <p className="text-xs leading-snug text-amber-700">{l.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
