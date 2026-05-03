'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/types/cart';
import { cartItemKey } from '@/types/cart';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  increaseQuantity: (productId: number, variationId?: number) => void;
  decreaseQuantity: (productId: number, variationId?: number) => void;
  clearCart: () => void;

  openDrawer: () => void;
  closeDrawer: () => void;

  getTotalCount: () => number;
  getSubtotal: () => number;
  hasItem: (productId: number, variationId?: number) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const key = cartItemKey(newItem);
          const existing = state.items.find((i) => cartItemKey(i) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartItemKey(i) === key
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + newItem.quantity,
                        i.max_quantity ?? 999
                      ),
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId, variationId) => {
        const key = cartItemKey({ product_id: productId, variation_id: variationId });
        set((state) => ({ items: state.items.filter((i) => cartItemKey(i) !== key) }));
      },

      updateQuantity: (productId, quantity, variationId) => {
        const key = cartItemKey({ product_id: productId, variation_id: variationId });
        if (quantity < 1) {
          get().removeItem(productId, variationId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (cartItemKey(i) !== key) return i;
            return { ...i, quantity: Math.min(quantity, i.max_quantity ?? 999) };
          }),
        }));
      },

      increaseQuantity: (productId, variationId) => {
        const key = cartItemKey({ product_id: productId, variation_id: variationId });
        set((state) => ({
          items: state.items.map((i) => {
            if (cartItemKey(i) !== key) return i;
            return { ...i, quantity: Math.min(i.quantity + 1, i.max_quantity ?? 999) };
          }),
        }));
      },

      decreaseQuantity: (productId, variationId) => {
        const { items, removeItem } = get();
        const key = cartItemKey({ product_id: productId, variation_id: variationId });
        const item = items.find((i) => cartItemKey(i) === key);
        if (!item) return;
        if (item.quantity <= 1) {
          removeItem(productId, variationId);
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              cartItemKey(i) === key ? { ...i, quantity: i.quantity - 1 } : i
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, i) => sum + parseFloat(i.price_for_display || '0') * i.quantity,
          0
        ),

      hasItem: (productId, variationId) => {
        const key = cartItemKey({ product_id: productId, variation_id: variationId });
        return get().items.some((i) => cartItemKey(i) === key);
      },
    }),
    {
      name: 'woo-cart',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
