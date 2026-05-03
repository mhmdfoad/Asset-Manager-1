'use client';

import { useTransition, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateProfileAction } from '@/app/actions/auth';
import type { WpProfile } from '@/lib/auth';

interface Labels {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email: string;
  saveChanges: string;
  saving: string;
  profileUpdated: string;
  error: string;
}

export default function ProfileForm({
  profile,
  labels,
}: {
  profile: WpProfile;
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
      const result = await updateProfileAction(null, fd);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? labels.error);
      }
    });
  }

  const inputClass =
    'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-100';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {labels.profileUpdated}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary-800">{labels.firstName}</label>
          <input
            type="text"
            name="first_name"
            defaultValue={profile.first_name}
            autoComplete="given-name"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary-800">{labels.lastName}</label>
          <input
            type="text"
            name="last_name"
            defaultValue={profile.last_name}
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">{labels.displayName}</label>
        <input
          type="text"
          name="display_name"
          defaultValue={profile.display_name}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">{labels.phone}</label>
        <input
          type="tel"
          name="billing_phone"
          defaultValue={profile.billing_phone}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">{labels.email}</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className={`${inputClass} cursor-not-allowed opacity-60`}
        />
      </div>

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
