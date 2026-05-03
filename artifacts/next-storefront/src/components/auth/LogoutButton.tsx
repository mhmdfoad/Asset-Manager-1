'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

export default function LogoutButton({ label }: { label: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push('/');
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
