import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface CartStore {
  items: CartItem[]
  promoCode: string | null
  discount: number
  addItem: (product: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  applyPromo: (code: string, discount: number) => void
  removePromo: () => void
  get subtotal(): number
  get deliveryCharge(): number
  get total(): number
  get itemCount(): number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return { items: state.items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) }
          }
          return { items: [...state.items, { ...product, qty: 1 }] }
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => i.id === id ? { ...i, qty } : i),
        })),

      clearCart: () => set({ items: [], promoCode: null, discount: 0 }),

      applyPromo: (code, discount) => set({ promoCode: code, discount }),

      removePromo: () => set({ promoCode: null, discount: 0 }),

      get subtotal() { return get().items.reduce((s, i) => s + i.price * i.qty, 0) },
      get deliveryCharge() { return get().subtotal >= 199 ? 0 : 25 },
      get total() { return get().subtotal - get().discount + get().deliveryCharge },
      get itemCount() { return get().items.reduce((s, i) => s + i.qty, 0) },
    }),
    { name: 'freshkart-cart' }
  )
)
