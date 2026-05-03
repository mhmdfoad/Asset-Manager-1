'use client';

import { useTransition, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateAddressAction } from '@/app/actions/auth';
import type { WpAddresses } from '@/lib/auth';

interface Labels {
  billingAddress: string;
  shippingAddress: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
  postcode: string;
  saveChanges: string;
  saving: string;
  addressUpdated: string;
  error: string;
}

export default function AddressForm({
  addresses,
  labels,
}: {
  addresses: WpAddresses;
  labels: Labels;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateAddressAction(null, fd);
      if (result.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.error ?? labels.error);
      }
    });
  }

  const inputClass =
    'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-100';

  function AddressSection({
    prefix,
    title,
  }: {
    prefix: 'billing' | 'shipping';
    title: string;
  }) {
    const v = (key: string) =>
      (addresses[`${prefix}_${key}` as keyof WpAddresses] as string) ?? '';

    return (
      <div>
        <h3 className="mb-4 text-base font-bold text-primary-800">{title}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.firstName}</label>
            <input type="text" name={`${prefix}_first_name`} defaultValue={v('first_name')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.lastName}</label>
            <input type="text" name={`${prefix}_last_name`} defaultValue={v('last_name')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-primary-800">{labels.company}</label>
            <input type="text" name={`${prefix}_company`} defaultValue={v('company')} className={inputClass} />
          </div>
          {prefix === 'billing' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary-800">{labels.email}</label>
                <input type="email" name="billing_email" defaultValue={v('email')} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary-800">{labels.phone}</label>
                <input type="tel" name="billing_phone" defaultValue={v('phone')} className={inputClass} />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.country}</label>
            <input type="text" name={`${prefix}_country`} defaultValue={v('country')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.city}</label>
            <input type="text" name={`${prefix}_city`} defaultValue={v('city')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.state}</label>
            <input type="text" name={`${prefix}_state`} defaultValue={v('state')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary-800">{labels.postcode}</label>
            <input type="text" name={`${prefix}_postcode`} defaultValue={v('postcode')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-primary-800">{labels.address1}</label>
            <input type="text" name={`${prefix}_address_1`} defaultValue={v('address_1')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-primary-800">{labels.address2}</label>
            <input type="text" name={`${prefix}_address_2`} defaultValue={v('address_2')} className={inputClass} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {labels.addressUpdated}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <AddressSection prefix="billing" title={labels.billingAddress} />
      <div className="border-t border-dashed border-neutral-200" />
      <AddressSection prefix="shipping" title={labels.shippingAddress} />

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 self-start rounded-full bg-accent-500 px-7 py-3 font-semibold text-white transition hover:bg-accent-400 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? labels.saving : labels.saveChanges}
      </button>
    </form>
  );
}
