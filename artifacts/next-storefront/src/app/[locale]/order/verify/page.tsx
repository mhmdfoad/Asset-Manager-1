import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ShoppingBag,
  AlertTriangle,
  Phone,
  Package,
  CreditCard,
  CalendarDays,
  ReceiptText,
} from 'lucide-react';
import {
  getWooOrder,
  getStatusCategory,
  toSafeOrderData,
  type SafeOrderData,
  type StatusCategory,
} from '@/lib/orders';
import { WooCommerceApiError } from '@/lib/woocommerce';
import CartClearer from '@/components/order/CartClearer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Verification | التحقق من الطلب',
};

/* ------------------------------------------------------------------ */
/* Types + helpers                                                      */
/* ------------------------------------------------------------------ */

type VerifyError = 'invalid_params' | 'not_found' | 'invalid_key' | 'fetch_failed';

interface StatusConfig {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  alertBorder: string;
  alertBg: string;
}

const STATUS_CONFIG: Record<StatusCategory, StatusConfig> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    alertBorder: 'border-emerald-200',
    alertBg: 'bg-emerald-50',
  },
  failed: {
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    alertBorder: 'border-red-200',
    alertBg: 'bg-red-50',
  },
  pending: {
    icon: Clock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    alertBorder: 'border-amber-200',
    alertBg: 'bg-amber-50',
  },
  'on-hold': {
    icon: Clock,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    alertBorder: 'border-blue-200',
    alertBg: 'bg-blue-50',
  },
  cancelled: {
    icon: Ban,
    iconColor: 'text-neutral-500',
    iconBg: 'bg-neutral-100',
    badgeBg: 'bg-neutral-100',
    badgeText: 'text-neutral-700',
    alertBorder: 'border-neutral-200',
    alertBg: 'bg-neutral-50',
  },
};

/* ------------------------------------------------------------------ */
/* Labels helper                                                        */
/* ------------------------------------------------------------------ */
function getLabels(isAr: boolean) {
  return isAr
    ? {
        successTitle: 'تمت عملية الدفع بنجاح',
        failedTitle: 'فشل الدفع',
        pendingTitle: 'الدفع معلّق',
        onHoldTitle: 'تم استلام الطلب – بانتظار التأكيد',
        cancelledTitle: 'تم إلغاء الطلب',
        successDesc: 'تم الدفع بنجاح وطلبك قيد المعالجة الآن. ستتلقى تأكيداً على بريدك.',
        failedDesc: 'تعذّر معالجة دفعتك. يمكنك المحاولة مرة أخرى أو التواصل مع الدعم.',
        pendingDesc: 'تم استلام طلبك وهو بانتظار تأكيد الدفع. سنتواصل معك قريباً.',
        onHoldDesc: 'تم استلام طلبك وهو بانتظار تأكيد من فريقنا.',
        cancelledDesc: 'تم إلغاء طلبك. تواصل معنا إذا كان هذا خطأً.',
        errorTitle: 'تعذّر التحقق من الطلب',
        errorDesc: 'لم نتمكن من التحقق من حالة طلبك. يرجى التواصل مع الدعم.',
        invalidParams: 'معلومات الطلب غير صحيحة. يرجى التحقق من الرابط.',
        notFound: 'لم يتم العثور على هذا الطلب.',
        invalidKey: 'فشل التحقق الأمني. الرابط غير صحيح أو منتهي الصلاحية.',
        fetchFailed: 'حدث خطأ أثناء التحقق من طلبك. يرجى المحاولة مرة أخرى.',
        orderNumber: 'رقم الطلب',
        orderStatus: 'حالة الطلب',
        total: 'الإجمالي',
        subtotal: 'المجموع الجزئي',
        tax: 'الضريبة',
        shipping: 'الشحن',
        discount: 'الخصم',
        paymentMethod: 'طريقة الدفع',
        dateCreated: 'تاريخ الطلب',
        items: 'المنتجات',
        continueShopping: 'متابعة التسوق',
        contactSupport: 'التواصل مع الدعم',
        returnToCart: 'العودة للسلة',
        tryAgain: 'إعادة المحاولة',
        statusLabels: {
          processing: 'قيد المعالجة',
          completed: 'مكتمل',
          pending: 'بانتظار الدفع',
          'on-hold': 'معلّق',
          failed: 'فشل',
          cancelled: 'ملغي',
          refunded: 'مسترجع',
        } as Record<string, string>,
      }
    : {
        successTitle: 'Payment Successful',
        failedTitle: 'Payment Failed',
        pendingTitle: 'Payment Pending',
        onHoldTitle: 'Order Received – Awaiting Confirmation',
        cancelledTitle: 'Order Cancelled',
        successDesc: 'Your payment was successful and your order is now being processed. A confirmation email is on its way.',
        failedDesc: 'Your payment could not be processed. Please try again or contact us for help.',
        pendingDesc: 'Your order has been received and is awaiting payment confirmation. We will be in touch soon.',
        onHoldDesc: 'Your order has been received and is awaiting confirmation from our team.',
        cancelledDesc: 'Your order has been cancelled. Contact us if this was a mistake.',
        errorTitle: 'Could Not Verify Order',
        errorDesc: 'We could not verify your order status. Please contact our support team.',
        invalidParams: 'Invalid order information. Please check the link you followed.',
        notFound: 'This order could not be found.',
        invalidKey: 'Security check failed. The order link appears invalid or expired.',
        fetchFailed: 'An error occurred while verifying your order. Please try again.',
        orderNumber: 'Order Number',
        orderStatus: 'Order Status',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        shipping: 'Shipping',
        discount: 'Discount',
        paymentMethod: 'Payment Method',
        dateCreated: 'Order Date',
        items: 'Items',
        continueShopping: 'Continue Shopping',
        contactSupport: 'Contact Support',
        returnToCart: 'Return to Cart',
        tryAgain: 'Try Again',
        statusLabels: {
          processing: 'Processing',
          completed: 'Completed',
          pending: 'Pending Payment',
          'on-hold': 'On Hold',
          failed: 'Failed',
          cancelled: 'Cancelled',
          refunded: 'Refunded',
        } as Record<string, string>,
      };
}

/* ------------------------------------------------------------------ */
/* Error state                                                          */
/* ------------------------------------------------------------------ */
function ErrorState({
  isAr,
  errorType,
  l,
}: {
  isAr: boolean;
  errorType: VerifyError;
  l: ReturnType<typeof getLabels>;
}) {
  const message =
    errorType === 'invalid_params'
      ? l.invalidParams
      : errorType === 'not_found'
        ? l.notFound
        : errorType === 'invalid_key'
          ? l.invalidKey
          : l.fetchFailed;

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
        <AlertTriangle className="h-12 w-12 text-neutral-500" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-primary-800">{l.errorTitle}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">{message}</p>
      <p className="mt-1 max-w-md text-sm text-neutral-400">{l.errorDesc}</p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-accent-400"
        >
          <ShoppingBag className="h-4 w-4" />
          {l.continueShopping}
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-3.5 font-semibold text-primary-800 transition-colors hover:border-accent-300 hover:bg-accent-50"
        >
          <Phone className="h-4 w-4" />
          {l.contactSupport}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Order summary card                                                   */
/* ------------------------------------------------------------------ */
function OrderCard({
  order,
  category,
  l,
  locale,
}: {
  order: SafeOrderData;
  category: StatusCategory;
  l: ReturnType<typeof getLabels>;
  locale: string;
}) {
  const cfg = STATUS_CONFIG[category];
  const statusLabel = l.statusLabels[order.status] ?? order.status;
  const sym = order.currency_symbol || order.currency;

  const fmt = (val: string) => {
    const n = parseFloat(val || '0');
    if (isNaN(n)) return val;
    return `${sym} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formattedDate = (() => {
    if (!order.date_created) return '—';
    try {
      return new Date(order.date_created).toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-GB',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );
    } catch {
      return order.date_created;
    }
  })();

  const showDiscount = parseFloat(order.discount_total || '0') > 0;
  const showTax = parseFloat(order.total_tax || '0') > 0;
  const showShipping = parseFloat(order.shipping_total || '0') > 0;

  return (
    <div className="mx-auto mt-8 w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Card header */}
      <div className={`flex items-center justify-between px-5 py-4 ${cfg.alertBg} border-b ${cfg.alertBorder}`}>
        <div>
          <p className="text-xs font-medium text-neutral-500">{l.orderNumber}</p>
          <p className="mt-0.5 text-lg font-bold text-primary-800">#{order.number || order.id}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
          {statusLabel}
        </span>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 px-5 py-4">
        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
          <div>
            <p className="text-xs text-neutral-400">{l.paymentMethod}</p>
            <p className="text-sm font-semibold text-primary-800">{order.payment_method_title || '—'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
          <div>
            <p className="text-xs text-neutral-400">{l.dateCreated}</p>
            <p className="text-sm font-semibold text-primary-800">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      {order.line_items.length > 0 && (
        <div className="border-b border-neutral-100 px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-neutral-400" />
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{l.items}</p>
          </div>
          <div className="flex flex-col gap-2">
            {order.line_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary-800 leading-snug">{item.name}</p>
                  <p className="text-xs text-neutral-400">× {item.quantity}</p>
                </div>
                <p className="flex-shrink-0 text-sm font-semibold text-accent-600">{fmt(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="px-5 py-4">
        <div className="flex flex-col gap-1.5">
          {showDiscount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{l.discount}</span>
              <span className="font-medium text-emerald-600">− {fmt(order.discount_total)}</span>
            </div>
          )}
          {showShipping && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{l.shipping}</span>
              <span className="font-medium text-primary-800">{fmt(order.shipping_total)}</span>
            </div>
          )}
          {showTax && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{l.tax}</span>
              <span className="font-medium text-primary-800">{fmt(order.total_tax)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-dashed border-neutral-200 pt-3">
          <div className="flex items-center gap-1.5">
            <ReceiptText className="h-4 w-4 text-neutral-400" />
            <span className="font-bold text-primary-800">{l.total}</span>
          </div>
          <span className="text-xl font-bold text-accent-600">{fmt(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default async function OrderVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string; key?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const isAr = locale === 'ar';
  const l = getLabels(isAr);

  /* ── 1. Validate query params ──────────────────────────────────── */
  const rawId = sp.order_id ?? '';
  const rawKey = (sp.key ?? '').trim();
  const orderId = parseInt(rawId, 10);

  if (!rawId || !rawKey || isNaN(orderId) || orderId <= 0) {
    return <ErrorState isAr={isAr} errorType="invalid_params" l={l} />;
  }

  /* ── 2. Fetch order server-side (no-store cache) ───────────────── */
  let order;
  try {
    order = await getWooOrder(orderId);
  } catch (err) {
    const errorType =
      err instanceof WooCommerceApiError && err.status === 404 ? 'not_found' : 'fetch_failed';
    return <ErrorState isAr={isAr} errorType={errorType as VerifyError} l={l} />;
  }

  /* ── 3. Verify order key (prevents URL forgery) ────────────────── */
  if (order.order_key !== rawKey) {
    return <ErrorState isAr={isAr} errorType="invalid_key" l={l} />;
  }

  /* ── 4. Determine status category ─────────────────────────────── */
  const category = getStatusCategory(order.status);
  const safeOrder = toSafeOrderData(order);
  const shouldClearCart = category === 'success';

  /* ── 5. Pick text based on category ───────────────────────────── */
  const cfg = STATUS_CONFIG[category];
  const Icon = cfg.icon;

  const title =
    category === 'success'
      ? l.successTitle
      : category === 'failed'
        ? l.failedTitle
        : category === 'cancelled'
          ? l.cancelledTitle
          : order.status === 'on-hold'
            ? l.onHoldTitle
            : l.pendingTitle;

  const desc =
    category === 'success'
      ? l.successDesc
      : category === 'failed'
        ? l.failedDesc
        : category === 'cancelled'
          ? l.cancelledDesc
          : order.status === 'on-hold'
            ? l.onHoldDesc
            : l.pendingDesc;

  /* ── 6. Render ─────────────────────────────────────────────────── */
  return (
    <div className="container flex flex-col items-center py-16 text-center">
      {/* Clear cart after verified success — client-only, no UI */}
      <CartClearer shouldClear={shouldClearCart} />

      {/* Status icon */}
      <div className={`flex h-24 w-24 items-center justify-center rounded-full ${cfg.iconBg}`}>
        <Icon className={`h-12 w-12 ${cfg.iconColor}`} />
      </div>

      {/* Title */}
      <h1 className="mt-6 text-3xl font-bold text-primary-800">{title}</h1>

      {/* Order number */}
      <p className="mt-1.5 text-sm font-medium text-neutral-500">
        {l.orderNumber}:{' '}
        <span className="font-bold text-primary-800">#{safeOrder.number || safeOrder.id}</span>
      </p>

      {/* Description */}
      <p className="mt-3 max-w-md text-neutral-600 leading-relaxed">{desc}</p>

      {/* Order card */}
      <OrderCard order={safeOrder} category={category} l={l} locale={locale} />

      {/* Action buttons */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        {/* Primary action depends on status */}
        {category === 'failed' || category === 'cancelled' ? (
          <Link
            href="/checkout"
            className="flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-accent-400"
          >
            {l.tryAgain}
          </Link>
        ) : (
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-accent-400"
          >
            <ShoppingBag className="h-4 w-4" />
            {l.continueShopping}
          </Link>
        )}

        {/* Secondary: contact support */}
        <Link
          href="/contact"
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-3.5 font-semibold text-primary-800 transition-colors hover:border-accent-300 hover:bg-accent-50"
        >
          <Phone className="h-4 w-4" />
          {l.contactSupport}
        </Link>
      </div>
    </div>
  );
}
