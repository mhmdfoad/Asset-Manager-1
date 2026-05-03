'use client';

import { create } from 'zustand';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface AppliedCoupon {
  code: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: string;
  calculated_discount: number;
  free_shipping: boolean;
  minimum_amount: string;
  description: string;
}

export interface SelectedShippingMethod {
  id: string;
  instance_id: number;
  method_id: string;
  title: string;
  cost: number;
  free: boolean;
}

/* ------------------------------------------------------------------ */
/* Store                                                                */
/* ------------------------------------------------------------------ */

interface CheckoutState {
  appliedCoupon: AppliedCoupon | null;
  selectedShippingMethod: SelectedShippingMethod | null;

  setAppliedCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
  setSelectedShippingMethod: (method: SelectedShippingMethod) => void;
  clearShippingMethod: () => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  appliedCoupon: null,
  selectedShippingMethod: null,

  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  clearCoupon: () => set({ appliedCoupon: null }),
  setSelectedShippingMethod: (method) => set({ selectedShippingMethod: method }),
  clearShippingMethod: () => set({ selectedShippingMethod: null }),
  clearCheckout: () => set({ appliedCoupon: null, selectedShippingMethod: null }),
}));
