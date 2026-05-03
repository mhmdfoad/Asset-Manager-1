'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toast-store';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="pointer-events-none fixed end-4 top-20 z-[200] flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border px-4 py-3 shadow-lg',
              'min-w-[240px] max-w-sm',
              styles[t.type]
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
