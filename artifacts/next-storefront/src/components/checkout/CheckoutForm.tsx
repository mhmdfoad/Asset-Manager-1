'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Loader2,
  ShoppingCart,
  Tag,
  FileText,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { createCheckoutSchema, type CheckoutFormData } from '@/lib/validations/checkout';
import { createOrderAction } from '@/app/actions/checkout';
import AddressFields from './AddressFields';
import OrderSummary from './OrderSummary';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  locale: string;
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                      */
/* ------------------------------------------------------------------ */
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-primary-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CheckoutForm                                                         */
/* ------------------------------------------------------------------ */
export default function CheckoutForm({ locale }: CheckoutFormProps) {
  const isAr = locale === 'ar';
  const router = useRouter();

  // ── Hydration guard ──────────────────────────────────────────────
  // Zustand persisted store reads from localStorage, which doesn't
  // exist on the server. We must wait until after mount before
  // accessing cart state to avoid React hydration mismatch (#418).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, getTotalCount } = useCartStore();
  const cartCount = mounted ? getTotalCount() : 0;
  const cartEmpty = cartCount === 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);

  const schema = useMemo(() => createCheckoutSchema(isAr), [isAr]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sameAsBilling: true,
      paymentMethod: 'cod',
      couponCode: '',
      customerNote: '',
    },
  });

  const sameAsBilling = watch('sameAsBilling');

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartEmpty) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      // Only send product_id, variation_id, quantity — never prices
      const cartItems = items.map((item) => ({
        product_id: item.product_id,
        ...(item.variation_id && item.variation_id > 0
          ? { variation_id: item.variation_id }
          : {}),
        quantity: item.quantity,
      }));

      const shippingAddress = data.sameAsBilling
        ? {
            first_name: data.billing.first_name,
            last_name: data.billing.last_name,
            company: data.billing.company,
            country: data.billing.country,
            city: data.billing.city,
            state: data.billing.state,
            address_1: data.billing.address_1,
            address_2: data.billing.address_2,
            postcode: data.billing.postcode,
          }
        : data.shipping;

      // Server Action — runs server-side, no fetch/API route needed
      const result = await createOrderAction({
        cartItems,
        billing: data.billing,
        shipping: shippingAddress,
        couponCode: data.couponCode?.trim() || undefined,
        customerNote: data.customerNote?.trim() || undefined,
        paymentMethod: data.paymentMethod,
      });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        router.push(`/${locale}/order/pending?order_id=${result.order_id}`);
      }
    } catch {
      setServerError(
        isAr
          ? 'تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى.'
          : 'Failed to submit the order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Labels                                                            */
  /* ---------------------------------------------------------------- */
  const l = isAr
    ? {
        billing: 'عنوان الفاتورة',
        shipping: 'عنوان الشحن',
        sameAsBilling: 'عنوان الشحن مطابق لعنوان الفاتورة',
        additionalInfo: 'معلومات إضافية',
        orderNotes: 'ملاحظات الطلب (اختياري)',
        orderNotesPlaceholder: 'ملاحظات خاصة لطلبك، مثل: ملاحظات التسليم...',
        haveCoupon: 'لديك كود خصم؟',
        couponCode: 'كود الخصم',
        couponPlaceholder: 'أدخل الكود هنا...',
        paymentMethod: 'طريقة الدفع',
        cod: 'الدفع عند الاستلام',
        codDesc: 'ادفع نقداً عند استلام طلبك',
        placeOrder: 'تأكيد الطلب',
        placingOrder: 'جاري إنشاء الطلب...',
        emptyCart: 'سلتك فارغة — أضف منتجات للمتابعة',
        shippingNote: 'الشحن يُحسب من قِبَل المتجر بناءً على عنوانك.',
      }
    : {
        billing: 'Billing Address',
        shipping: 'Shipping Address',
        sameAsBilling: 'Shipping address same as billing',
        additionalInfo: 'Additional Information',
        orderNotes: 'Order Notes (Optional)',
        orderNotesPlaceholder: 'Special notes for your order, e.g. delivery instructions...',
        haveCoupon: 'Have a coupon?',
        couponCode: 'Coupon Code',
        couponPlaceholder: 'Enter coupon code...',
        paymentMethod: 'Payment Method',
        cod: 'Cash on Delivery',
        codDesc: 'Pay with cash upon delivery',
        placeOrder: 'Place Order',
        placingOrder: 'Creating Order...',
        emptyCart: 'Your cart is empty — add items to continue',
        shippingNote: 'Shipping is calculated by the store based on your address.',
      };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── Left column: form ─────────────────────────────────── */}
        <div className="flex flex-col gap-5 lg:col-span-2">

          {/* Billing */}
          <Section title={l.billing} icon={CreditCard}>
            <AddressFields
              prefix="billing"
              register={register}
              errors={errors}
              isAr={isAr}
              includeContact
            />
          </Section>

          {/* Same-as-billing toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:bg-neutral-50">
            <input
              type="checkbox"
              {...register('sameAsBilling')}
              className="h-4 w-4 rounded border-neutral-300 accent-accent-500"
            />
            <span className="text-sm font-medium text-primary-800">{l.sameAsBilling}</span>
          </label>

          {/* Shipping — only when not same as billing */}
          {!sameAsBilling && (
            <Section title={l.shipping} icon={CreditCard}>
              <AddressFields
                prefix="shipping"
                register={register}
                errors={errors}
                isAr={isAr}
              />
            </Section>
          )}

          {/* Payment method */}
          <Section title={l.paymentMethod} icon={CreditCard}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-accent-400 bg-accent-50 p-4">
              <input
                type="radio"
                value="cod"
                {...register('paymentMethod')}
                defaultChecked
                className="h-4 w-4 accent-accent-500"
              />
              <div>
                <p className="font-semibold text-primary-800">{l.cod}</p>
                <p className="text-sm text-neutral-500">{l.codDesc}</p>
              </div>
            </label>
            <p className="mt-3 text-xs text-neutral-400">
              {isAr
                ? '* طرق دفع إضافية (بطاقة ائتمان، تحويل بنكي) ستتوفر في مرحلة قادمة.'
                : '* Additional payment methods (credit card, bank transfer) will be available in a future update.'}
            </p>
          </Section>

          {/* Additional info: notes + coupon */}
          <Section title={l.additionalInfo} icon={FileText}>
            {/* Order notes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary-800">{l.orderNotes}</label>
              <textarea
                rows={3}
                placeholder={l.orderNotesPlaceholder}
                {...register('customerNote')}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-primary-800 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400"
              />
            </div>

            {/* Coupon */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setCouponOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-500"
              >
                <Tag className="h-3.5 w-3.5" />
                {l.haveCoupon}
              </button>

              {couponOpen && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder={l.couponPlaceholder}
                    dir="ltr"
                    {...register('couponCode')}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400"
                  />
                </div>
              )}
            </div>
          </Section>

          {/* Shipping note */}
          <p className="text-center text-xs text-neutral-400">{l.shippingNote}</p>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{serverError}</p>
            </div>
          )}

          {/* Empty cart warning — only shown after mount to avoid hydration mismatch */}
          {mounted && cartEmpty && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
              <ShoppingCart className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{l.emptyCart}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={cartEmpty || isSubmitting}
            className={cn(
              'flex items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all',
              cartEmpty || isSubmitting
                ? 'cursor-not-allowed bg-neutral-300 shadow-none'
                : 'bg-accent-500 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/30'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {l.placingOrder}
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                {l.placeOrder}
              </>
            )}
          </button>
        </div>

        {/* ── Right column: order summary ──────────────────────── */}
        <div className="lg:col-span-1">
          <OrderSummary locale={locale} />
        </div>

      </div>
    </form>
  );
}
