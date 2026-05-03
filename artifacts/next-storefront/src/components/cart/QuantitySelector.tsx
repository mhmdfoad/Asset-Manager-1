'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (qty: number) => void;
  locale?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function QuantitySelector({
  quantity,
  min = 1,
  max = 999,
  onChange,
  locale,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const isAr = locale === 'ar';

  const btnBase =
    'flex items-center justify-center border border-neutral-200 bg-white font-medium text-neutral-700 transition-colors hover:border-accent-400 hover:bg-accent-50 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40';

  const sizes = {
    sm: { btn: 'h-7 w-7 rounded-lg', input: 'h-7 w-9 text-sm rounded-lg' },
    md: { btn: 'h-10 w-10 rounded-xl', input: 'h-10 w-12 text-base rounded-xl' },
  };

  const s = sizes[size];

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="group"
      aria-label={isAr ? 'الكمية' : 'Quantity'}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label={isAr ? 'تقليل الكمية' : 'Decrease quantity'}
        className={cn(btnBase, s.btn)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <input
        type="number"
        value={quantity}
        min={min}
        max={max}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) onChange(Math.min(Math.max(min, val), max));
        }}
        className={cn(
          'border border-neutral-200 bg-white text-center font-semibold text-primary-800 outline-none',
          'focus:border-accent-400',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          s.input
        )}
        aria-label={isAr ? 'الكمية' : 'Quantity'}
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
        className={cn(btnBase, s.btn)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
