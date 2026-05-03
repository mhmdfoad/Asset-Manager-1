'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Loader2,
  ShoppingCart,
  FileText,
  CreditCard,
  CheckCircle,
  Info,
  X,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';
import { createCheckoutSchema, type CheckoutFormData } from '@/lib/validations/checkout';
import { createOrderAction } from '@/app/actions/checkout';
import AddressFields from './AddressFields';
import OrderSummary from './OrderSummary';
import CouponInput from './CouponInput';
import ShippingMethodSelector from './ShippingMethodSelector';
import { cn } from '@/lib/utils';

export interface CheckoutPrefillData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    address_1: string;
    address_2: string;
    postcode: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    country: string;
    state: string;
    city: string;
    address_1: string;
    address_2: string;
    postcode: string;
  };
}

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

interface CheckoutFormProps {
  locale: string;
  prefillData?: CheckoutPrefillData | null;
}

export default function CheckoutForm({ locale, prefillData }: CheckoutFormProps) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { items, getTotalCount, getSubtotal, clearCart } = useCartStore();
  const { appliedCoupon, selectedShippingMethod, clearCheckout } = useCheckoutStore();

  const cartCount = mounted ? getTotalCount() : 0;
  const cartEmpty = cartCount === 0;
  const subtotal = mounted ? getSubtotal() : 0;

  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [failedFieldLabels, setFailedFieldLabels] = useState<string[]>([]);
  const [prefillNoticeDismissed, setPrefillNoticeDismissed] = useState(false);

  const hasPrefill = Boolean(prefillData && (prefillData.billing.first_name || prefillData.billing.email));

  const schema = useMemo(() => createCheckoutSchema(isAr), [isAr]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sameAsBilling: true,
      paymentMethod: 'cod',
      couponCode: '',
      customerNote: '',
      ...(prefillData
        ? {
            billing: {
              first_name: prefillData.billing.first_name,
              last_name: prefillData.billing.last_name,
              email: prefillData.billing.email,
              phone: prefillData.billing.phone,
              country: prefillData.billing.country,
              state: prefillData.billing.state,
              city: prefillData.billing.city,
              address_1: prefillData.billing.address_1,
              address_2: prefillData.billing.address_2,
              postcode: prefillData.billing.postcode,
              company: '',
            },
            ...(prefillData.shipping.country &&
            prefillData.shipping.city &&
            prefillData.shipping.address_1
              ? {
                  shipping: {
                    first_name: prefillData.shipping.first_name,
                    last_name: prefillData.shipping.last_name,
                    country: prefillData.shipping.country,
                    state: prefillData.shipping.state,
                    city: prefillData.shipping.city,
                    address_1: prefillData.shipping.address_1,
                    address_2: prefillData.shipping.address_2,
                    postcode: prefillData.shipping.postcode,
                    company: '',
                  },
                }
              : {}),
          }
        : {}),
    },
  });

  const sameAsBilling = watch('sameAsBilling');
  const billingCountry = watch('billing.country');
  const billingState = watch('billing.state');
  const shippingCountry = watch('shipping.country');
  const shippingState = watch('shipping.state');

  const effectiveCountry = sameAsBilling ? billingCountry : (shippingCountry || billingCountry);
  const effectiveState = sameAsBilling ? billingState : (shippingState || billingState);

  const fieldLabels = useMemo(
    () =>
      isAr
        ? {
            first_name: 'الاسم الأول',
            last_name: 'اسم العائلة',
            email: 'البريد الإلكتروني',
            phone: 'رقم الجوال',
            country: 'الدولة',
            city: 'المدينة',
            address_1: 'العنوان',
          }
        : {
            first_name: 'First Name',
            last_name: 'Last Name',
            email: 'Email',
            phone: 'Phone Number',
            country: 'Country',
            city: 'City',
            address_1: 'Address',
          },
    [isAr]
  );

  const onValidationError = useCallback(
    (fieldErrors: FieldErrors<CheckoutFormData>) => {
      const billingErrors = fieldErrors.billing as Record<string, { message?: string }> | undefined;
      const failing = Object.keys(billingErrors ?? {})
        .filter((k) => billingErrors?.[k]?.message)
        .map((k) => fieldLabels[k as keyof typeof fieldLabels] ?? k);

      const shippingErrors = fieldErrors.shipping as Record<string, { message?: string }> | undefined;
      const failingShipping = Object.keys(shippingErrors ?? {})
        .filter((k) => shippingErrors?.[k]?.message)
        .map((k) => fieldLabels[k as keyof typeof fieldLabels] ?? k);

      setFailedFieldLabels([...failing, ...failingShipping]);
      setValidationError(true);

      if (formRef.current) {
        const firstInvalid = formRef.current.querySelector<HTMLElement>(
          'input.border-red-300, select.border-red-300, textarea.border-red-300'
        );
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus({ preventScroll: true });
        } else {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [fieldLabels]
  );

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartEmpty) return;

    setValidationError(false);
    setFailedFieldLabels([]);
    setIsSubmitting(true);
    setServerError(null);

    try {
      const cartItems = items.map((item) => ({
        product_id: item.product_id,
        ...(item.variation_id && item.variation_id > 0 ? { variation_id: item.variation_id } : {}),
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

      const couponCode = appliedCoupon?.code || data.couponCode?.trim() || undefined;

      const result = await createOrderAction({
        cartItems,
        billing: data.billing,
        shipping: shippingAddress,
        couponCode,
        customerNote: data.customerNote?.trim() || undefined,
        paymentMethod: data.paymentMethod,
        shippingMethodId: selectedShippingMethod?.id,
        shippingCountry: effectiveCountry || undefined,
        shippingState: effectiveState || undefined,
      });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      clearCart();
      clearCheckout();

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

  const l = isAr
    ? {
        billing: 'عنوان الفاتورة',
        shipping: 'عنوان الشحن',
        sameAsBilling: 'عنوان الشحن مطابق لعنوان الفاتورة',
        shippingMethod: 'طريقة الشحن',
        additionalInfo: 'معلومات إضافية',
        orderNotes: 'ملاحظات الطلب (اختياري)',
        orderNotesPlaceholder: 'ملاحظات خاصة لطلبك، مثل: ملاحظات التسليم...',
        paymentMethod: 'طريقة الدفع',
        cod: 'الدفع عند الاستلام',
        codDesc: 'ادفع نقداً عند استلام طلبك',
        placeOrder: 'تأكيد الطلب',
        placingOrder: 'جاري إنشاء الطلب...',
        emptyCart: 'سلتك فارغة — أضف منتجات للمتابعة',
        prefillNotice: 'تم تعبئة بياناتك المحفوظة تلقائياً، ويمكنك تعديلها قبل إتمام الطلب.',
        validationError: 'يرجى تصحيح الحقول المشار إليها بالأحمر قبل المتابعة.',
      }
    : {
        billing: 'Billing Address',
        shipping: 'Shipping Address',
        sameAsBilling: 'Shipping address same as billing',
        shippingMethod: 'Shipping Method',
        additionalInfo: 'Additional Information',
        orderNotes: 'Order Notes (Optional)',
        orderNotesPlaceholder: 'Special notes for your order, e.g. delivery instructions...',
        paymentMethod: 'Payment Method',
        cod: 'Cash on Delivery',
        codDesc: 'Pay with cash upon delivery',
        placeOrder: 'Place Order',
        placingOrder: 'Creating Order...',
        emptyCart: 'Your cart is empty — add items to continue',
        prefillNotice:
          'Your saved details were filled automatically. You can edit them before placing the order.',
        validationError: 'Please fix the fields highlighted in red before continuing.',
      };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onValidationError)} noValidate>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {validationError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm leading-relaxed">
                <p>{l.validationError}</p>
                {failedFieldLabels.length > 0 && (
                  <ul className="mt-1.5 list-disc ps-4">
                    {failedFieldLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {hasPrefill && !prefillNoticeDismissed && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-blue-700">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{l.prefillNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setPrefillNoticeDismissed(true)}
                className="flex-shrink-0 rounded p-0.5 hover:bg-blue-100"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Section title={l.billing} icon={CreditCard}>
            <AddressFields
              prefix="billing"
              register={register}
              errors={errors}
              isAr={isAr}
              includeContact
            />
          </Section>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:bg-neutral-50">
            <input
              type="checkbox"
              {...register('sameAsBilling')}
              className="h-4 w-4 rounded border-neutral-300 accent-accent-500"
            />
            <span className="text-sm font-medium text-primary-800">{l.sameAsBilling}</span>
          </label>

          {!sameAsBilling && (
            <Section title={l.shipping} icon={CreditCard}>
              <AddressFields prefix="shipping" register={register} errors={errors} isAr={isAr} />
            </Section>
          )}

          {mounted && (
            <Section title={l.shippingMethod} icon={Truck}>
              <ShippingMethodSelector
                country={billingCountry || ''}
                state={billingState || ''}
                subtotal={subtotal}
                hasCoupon={!!appliedCoupon}
                locale={locale}
              />
            </Section>
          )}

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

          <Section title={l.additionalInfo} icon={FileText}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary-800">{l.orderNotes}</label>
              <textarea
                rows={3}
                placeholder={l.orderNotesPlaceholder}
                {...register('customerNote')}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-primary-800 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400"
              />
            </div>

            <div className="mt-4">
              <CouponInput
                subtotal={subtotal}
                locale={locale}
                onApplied={(code) => setValue('couponCode', code)}
                onCleared={() => setValue('couponCode', '')}
              />
            </div>
          </Section>

          {serverError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{serverError}</p>
            </div>
          )}

          {mounted && cartEmpty && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
              <ShoppingCart className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{l.emptyCart}</p>
            </div>
          )}

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

        <div className="lg:col-span-1">
          <OrderSummary locale={locale} />
        </div>
      </div>
    </form>
  );
}
