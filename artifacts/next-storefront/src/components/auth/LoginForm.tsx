'use client';

import { useState, useTransition } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';

interface Labels {
  emailOrUsername: string;
  password: string;
  login: string;
  loggingIn: string;
  forgotPassword: string;
  noAccount: string;
  register: string;
  error: string;
}

export default function LoginForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(null, fd);
      if (result.success) {
        router.push('/account');
        router.refresh();
      } else {
        setError(result.error ?? labels.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-primary-800">
          {labels.emailOrUsername} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username_or_email"
          required
          autoComplete="email"
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-100"
        />
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
            autoComplete="current-password"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pe-11 text-sm transition focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-100"
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

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-full bg-accent-500 py-3.5 font-semibold text-white shadow-md shadow-accent-200/50 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? labels.loggingIn : labels.login}
      </button>

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="text-neutral-400">{labels.noAccount}</span>
        <Link
          href="/register"
          className="font-semibold text-accent-600 hover:text-accent-500 hover:underline"
        >
          {labels.register}
        </Link>
      </div>
    </form>
  );
}
