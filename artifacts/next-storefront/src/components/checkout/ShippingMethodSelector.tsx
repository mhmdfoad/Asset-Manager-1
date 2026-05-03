'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { getShippingMethodsAction } from '@/app/actions/cart';
import { useCheckoutStore, type SelectedShippingMethod } from '@/store/checkout-store';
import { formatPrice } from '@/lib/format';

interface ShippingMethodSelectorProps {
  country: string;
  state?: string;
  subtotal: number;
  hasCoupon: boolean;
  locale: string;
}

interface MethodsState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  methods: SelectedShippingMethod[];
  error: string | null;
}

export default function ShippingMethodSelector({
  country,
  state,
  subtotal,
  hasCoupon,
  locale,
}: ShippingMethodSelectorProps) {
  const isAr = locale === 'ar';
  const { selectedShippingMethod, setSelectedShippingMethod, clearShippingMethod } =
    useCheckoutStore();

  const [methodsState, setMethodsState] = useState<MethodsState>({
    status: 'idle',
    methods: [],
    error: null,
  });

  const [isPending, startTransition] = useTransition();
  const lastFetchKey = useRef<string>('');

  const l = isAr
    ? {
        title: 'طريقة الشحن',
        loading: 'جاري تحميل طرق الشحن...',
        noMethods: 'لا تتوفر طرق شحن لهذا العنوان.',
        error: 'تعذّر تحميل طرق الشحن.',
        free: 'مجاني',
        enterCountry: 'أدخل الدولة لعرض طرق الشحن المتاحة.',
      }
    : {
        title: 'Shipping Method',
        loading: 'Loading shipping methods...',
        noMethods: 'No shipping methods available for this address.',
        error: 'Failed to load shipping methods.',
        free: 'Free',
        enterCountry: 'Enter a country to see available shipping methods.',
      };

  // Fetch methods whenever country/state/subtotal/hasCoupon changes
  useEffect(() => {
    if (!country || country.length < 2) {
      setMethodsState({ status: 'idle', methods: [], error: null });
      clearShippingMethod();
      return;
    }

    const fetchKey = `${country}|${state ?? ''}|${subtotal}|${hasCoupon}`;
    if (fetchKey === lastFetchKey.current) return;
    lastFetchKey.current = fetchKey;

    setMethodsState({ status: 'loading', methods: [], error: null });

    startTransition(async () => {
      const result = await getShippingMethodsAction(country, state, subtotal, hasCoupon);

      if (!result.success) {
        setMethodsState({ status: 'error', methods: [], error: result.error });
        clearShippingMethod();
        return;
      }

      const methods: SelectedShippingMethod[] = result.methods.map((m) => ({
        id: m.id,
        instance_id: m.instance_id,
        method_id: m.method_id,
        title: m.title,
        cost: m.cost,
        free: m.free,
      }));

      setMethodsState({ status: 'loaded', methods, error: null });

      // Auto-select first method if nothing is selected yet,
      // or re-validate current selection (method may no longer exist for this country)
      if (methods.length > 0) {
        const stillValid = selectedShippingMethod
          ? methods.some((m) => m.id === selectedShippingMethod.id)
          : false;
        if (!stillValid) {
          setSelectedShippingMethod(methods[0]);
        }
      } else {
        clearShippingMethod();
      }
    });
  }, [country, state, subtotal, hasCoupon]); // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render at all if country not entered yet
  if (!country || country.length < 2) {
    return (
      <p className="text-xs text-neutral-400">{l.enterCountry}</p>
    );
  }

  if (methodsState.status === 'loading' || isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-accent-500" />
        {l.loading}
      </div>
    );
  }

  if (methodsState.status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {l.error}
      </div>
    );
  }

  if (methodsState.status === 'loaded' && methodsState.methods.length === 0) {
    return (
      <p className="text-sm text-neutral-400">{l.noMethods}</p>
    );
  }

  if (methodsState.methods.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {methodsState.methods.map((method) => {
        const isSelected = selectedShippingMethod?.id === method.id;
        return (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 transition-colors ${
              isSelected
                ? 'border-accent-400 bg-accent-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                checked={isSelected}
                onChange={() => setSelectedShippingMethod(method)}
                className="h-4 w-4 accent-accent-500"
              />
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                <span className="text-sm font-medium text-primary-800">{method.title}</span>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                method.free ? 'text-green-600' : 'text-primary-800'
              }`}
            >
              {method.free ? l.free : formatPrice(method.cost.toFixed(2))}
            </span>
          </label>
        );
      })}
    </div>
  );
}
