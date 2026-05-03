'use client';

/**
 * Invisible client component that clears the Zustand cart after a verified
 * successful payment (status: processing | completed).
 *
 * Runs once on mount — safe to re-render without double-clearing.
 */

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';

interface CartClearerProps {
  shouldClear: boolean;
}

export default function CartClearer({ shouldClear }: CartClearerProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const cleared = useRef(false);

  useEffect(() => {
    if (shouldClear && !cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [shouldClear, clearCart]);

  return null;
}
