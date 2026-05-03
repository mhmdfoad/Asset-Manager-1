'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ShoppingBag, Info } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
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
  const subtotal = mounted ? getSubtotal() : 0;
  const count = mounted ? getTotalCount() : 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="text-base font-bold text-primary-800">
          {isAr ? 'ملخص الطلب' : 'Order Summary'}
        </h2>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto px-5 py-4">
        {!mounted ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-200 border-t-accent-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-400">
            <ShoppingBag className="h-8 w-8" />
            <p className="text-sm">{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</p>
            <Link
              href="/shop"
              className="mt-1 text-sm font-medium text-accent-600 hover:text-accent-500"
            >
              {isAr ? 'تصفح المنتجات' : 'Browse products'}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const key = cartItemKey(item);
              const displayPrice = item.sale_price_for_display || item.price_for_display;

              return (
                <div key={key} className="flex items-start gap-3">
                  {/* Image */}
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

                  {/* Price */}
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{isAr ? 'المجموع الجزئي' : 'Subtotal'}</span>
            <span className="font-semibold text-primary-800">
              {formatPrice(subtotal.toFixed(2))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{isAr ? 'الشحن' : 'Shipping'}</span>
            <span className="text-neutral-400">
              {isAr ? 'يُحسب لاحقاً' : 'Calculated by store'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{isAr ? 'الضريبة' : 'Tax'}</span>
            <span className="text-neutral-400">{isAr ? 'قد تنطبق' : 'May apply'}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-dashed border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-800">
              {isAr ? 'الإجمالي المقدّر' : 'Est. Total'}
            </span>
            <span className="text-lg font-bold text-accent-600">
              {formatPrice(subtotal.toFixed(2))}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <p className="text-xs leading-snug text-amber-700">
            {isAr
              ? 'الإجمالي النهائي يشمل الشحن والضرائب ويُحسب بواسطة المتجر عند إتمام الطلب.'
              : 'Final total includes shipping & taxes, calculated by the store upon order creation.'}
          </p>
        </div>
      </div>
    </div>
  );
}
