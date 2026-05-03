'use client';

import { useState, useTransition } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerAction } from '@/app/actions/auth';

interface Labels {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  register: string;
  registering: string;
  haveAccount: string;
  login: string;
  error: string;
}

export default function RegisterForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerAction(null, fd);
      if (result.success) {
        router.push('/account');
        router.refresh();
      } else {
        setError(result.error ?? labels.error);
      }
    });
  }

  const inputClass =
    'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-100';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary-800">
            {labels.firstName} <span className="text-red-500">*</span>
          </label>
          <input type="text" name="first_name" required autoComplete="given-name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary-800">
            {labels.lastName} <span className="text-red-500">*</span>
          </label>
          <input type="text" name="last_name" required autoComplete="family-name" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">
          {labels.email} <span className="text-red-500">*</span>
        </label>
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">{labels.phone}</label>
        <input type="tel" name="phone" autoComplete="tel" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">
          {labels.password} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={`w-full pe-11 ${inputClass}`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((p) => !p)}
            className="absolute inset-y-0 end-0 flex items-center px-3 text-neutral-400 hover:text-neutral-600"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">
          {labels.confirmPassword} <span className="text-red-500">*</span>
        </label>
        <input
          type={showPass ? 'text' : 'password'}
          name="confirm_password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-full bg-accent-500 py-3.5 font-semibold text-white shadow-md shadow-accent-200/50 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? labels.registering : labels.register}
      </button>

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="text-neutral-400">{labels.haveAccount}</span>
        <Link
          href="/login"
          className="font-semibold text-accent-600 hover:text-accent-500 hover:underline"
        >
          {labels.login}
        </Link>
      </div>
    </form>
  );
}
