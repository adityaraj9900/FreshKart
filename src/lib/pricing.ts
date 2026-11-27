import type { PromoCode } from '@prisma/client'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/catalog'

export type PromoResult = { ok: true; discount: number } | { ok: false; error: string }

/** Single source of truth for coupon rules, used by both /api/promo/validate and order creation. */
export function evaluatePromo(promo: PromoCode | null, subtotal: number): PromoResult {
  if (!promo || !promo.active) return { ok: false, error: 'This coupon code is not valid' }
  if (subtotal < promo.minOrder) return { ok: false, error: `Add items worth ₹${promo.minOrder - subtotal} more to use this code (min. order ₹${promo.minOrder})` }
  const raw = promo.type === 'percent' ? (subtotal * promo.discount) / 100 : promo.discount
  const discount = Math.round(Math.min(raw, promo.maxDiscount, subtotal) * 100) / 100
  return { ok: true, discount }
}

export const deliveryChargeFor = (subtotal: number) => (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE)
