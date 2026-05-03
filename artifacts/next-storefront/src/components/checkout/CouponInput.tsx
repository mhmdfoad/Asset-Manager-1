'use client';

import { useState, useTransition } from 'react';
import { Tag, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { validateCouponAction } from '@/app/actions/cart';
import { useCheckoutStore } from '@/store/checkout-store';
import { formatPrice } from '@/lib/format';

interface CouponInputProps {
  subtotal: number;
  locale: string;
  /** Called when a coupon is successfully applied — used to sync form state */
  onApplied?: (code: string) => void;
  /** Called when coupon is removed */
  onCleared?: () => void;
}

export default function CouponInput({
  subtotal,
  locale,
  onApplied,
  onCleared,
}: CouponInputProps) {
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { appliedCoupon, setAppliedCoupon, clearCoupon } = useCheckoutStore();

  const l = isAr
    ? {
        haveCoupon: 'لديك كود خصم؟',
        placeholder: 'أدخل كود الخصم...',
        apply: 'تطبيق',
        validating: 'جاري التحقق...',
        applied: 'تم تطبيق كود الخصم',
        discount: 'خصم',
        remove: 'إزالة',
        free: 'مجاني',
      }
    : {
        haveCoupon: 'Have a coupon?',
        placeholder: 'Enter coupon code...',
        apply: 'Apply',
        validating: 'Validating...',
        applied: 'Coupon applied',
        discount: 'discount',
        remove: 'Remove',
        free: 'Free',
      };

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);

    startTransition(async () => {
      const result = await validateCouponAction(trimmed, subtotal);
      if (result.success) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount_type: result.coupon.discount_type,
          amount: result.coupon.amount,
          calculated_discount: result.coupon.calculated_discount,
          free_shipping: result.coupon.free_shipping,
          minimum_amount: result.coupon.minimum_amount,
          description: result.coupon.description,
        });
        setCode('');
        setOpen(false);
        onApplied?.(result.coupon.code);
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemove = () => {
    clearCoupon();
    setError(null);
    setCode('');
    onCleared?.();
  };

  /* Applied state */
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              <span className="font-mono uppercase">{appliedCoupon.code}</span>
              {' — '}
              {appliedCoupon.discount_type === 'percent'
                ? `${appliedCoupon.amount}% ${l.discount}`
                : formatPrice(appliedCoupon.calculated_discount.toFixed(2))}
              {appliedCoupon.free_shipping && (
                <span className="ms-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  + {l.free} {isAr ? 'شحن' : 'shipping'}
                </span>
              )}
            </p>
            <p className="text-xs text-green-600">{l.applied}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 rounded-lg p-1.5 text-green-700 transition-colors hover:bg-green-100"
          aria-label={l.remove}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  /* Input state */
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-accent-600 transition-colors hover:text-accent-500"
      >
        <Tag className="h-3.5 w-3.5" />
        {l.haveCoupon}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder={l.placeholder}
              dir="ltr"
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400 disabled:opacity-60"
              disabled={isPending}
              autoFocus
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={isPending || !code.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? l.validating : l.apply}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
