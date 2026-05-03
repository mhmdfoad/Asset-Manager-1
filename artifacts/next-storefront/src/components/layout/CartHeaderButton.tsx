'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

interface CartHeaderButtonProps {
  ariaLabel: string;
}

export default function CartHeaderButton({ ariaLabel }: CartHeaderButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { getTotalCount, openDrawer } = useCartStore();

  // Only read localStorage-hydrated count after mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? getTotalCount() : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={ariaLabel}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-accent-600"
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      <span
        className={`absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-0.5 text-[10px] font-bold text-white transition-opacity duration-200 ${
          count > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={count === 0}
      >
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
}
