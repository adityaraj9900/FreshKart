import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/catalog'

export { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD }

export interface CartItem {
  id: string
  name: string
  price: number
  mrp: number
  unit: string
  emoji: string
  qty: number
  brand: string
}

interface CartState {
  items: CartItem[]
  promoCode: string | null
  discount: number
  addItem: (product: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  applyPromo: (code: string, discount: number) => void
  removePromo: () => void
}

// Derived values are computed from state, not stored as getters on the store:
// zustand copies state with Object.assign on every update, which turns getters
// into plain values frozen at their previous result.
export function getCartTotals(items: CartItem[], discount: number) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const mrpTotal = items.reduce((sum, i) => sum + Math.max(i.mrp, i.price) * i.qty, 0)
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)
  const deliveryCharge = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const appliedDiscount = Math.min(discount, subtotal)
  const total = Math.max(0, subtotal - appliedDiscount + deliveryCharge)
  return {
    subtotal,
    mrpTotal,
    itemCount,
    deliveryCharge,
    discount: appliedDiscount,
    total,
    savings: mrpTotal - subtotal + appliedDiscount,
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      discount: 0,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return { items: state.items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)) }
          }
          return { items: [...state.items, { ...product, qty: 1 }] }
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((state) => ({
          items: qty <= 0 ? state.items.filter((i) => i.id !== id) : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),

      clearCart: () => set({ items: [], promoCode: null, discount: 0 }),
      applyPromo: (code, discount) => set({ promoCode: code, discount }),
      removePromo: () => set({ promoCode: null, discount: 0 }),
    }),
    {
      name: 'freshkart-cart',
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode, discount: s.discount }),
    }
  )
)

export function useCartTotals() {
  const items = useCartStore((s) => s.items)
  const discount = useCartStore((s) => s.discount)
  return getCartTotals(items, discount)
}
