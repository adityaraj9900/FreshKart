'use client'
import { useState } from 'react'
import { Heart, Star, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatINR } from '@/lib/catalog'

export interface Product {
  id: string
  name: string
  price: number
  mrp: number
  unit: string
  emoji: string
  badge?: string | null
  brand: string
  rating: number
  reviews: number
  stock: number
  description: string
  category?: { name: string; slug: string }
}

export const discountPct = (p: Pick<Product, 'price' | 'mrp'>) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0)
export const compactCount = (n: number) => (n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n))

export function QtyControl({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const qty = useCartStore((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0)
  const addItem = useCartStore((s) => s.addItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const h = size === 'lg' ? 'h-11 text-sm' : 'h-9 text-[13px]'

  if (product.stock <= 0) {
    return <span className={`${h} inline-flex items-center rounded-lg bg-gray-100 px-3 font-semibold text-gray-400`}>Out of stock</span>
  }
  if (qty === 0) {
    return (
      <button
        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, unit: product.unit, emoji: product.emoji, qty: 1, brand: product.brand })}
        aria-label={`Add ${product.name} to cart`}
        className={`${h} ${size === 'lg' ? 'w-full' : 'min-w-[76px]'} rounded-lg border border-brand-600 bg-brand-50 px-4 font-bold uppercase tracking-wide text-brand-700 transition hover:bg-brand-600 hover:text-white active:scale-95`}
      >
        Add
      </button>
    )
  }
  return (
    <div className={`${h} ${size === 'lg' ? 'w-full' : 'min-w-[76px]'} flex items-center justify-between rounded-lg bg-brand-600 font-bold text-white shadow-sm`}>
      <button onClick={() => updateQty(product.id, qty - 1)} aria-label={`Remove one ${product.name}`} className="grid h-full w-8 place-items-center rounded-l-lg hover:bg-brand-700">
        <Minus size={14} strokeWidth={3} />
      </button>
      <span aria-live="polite" className="min-w-5 text-center tabular-nums">{qty}</span>
      <button
        onClick={() => (qty < product.stock ? updateQty(product.id, qty + 1) : undefined)}
        disabled={qty >= product.stock}
        aria-label={`Add one more ${product.name}`}
        className="grid h-full w-8 place-items-center rounded-r-lg hover:bg-brand-700 disabled:opacity-50"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  )
}

export default function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const [wished, setWished] = useState(false)
  const off = discountPct(product)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white transition hover:border-gray-300 hover:shadow-card">
      <button
        onClick={() => onQuickView?.(product)}
        aria-label={`View details for ${product.name}`}
        className="relative flex h-36 items-center justify-center bg-gradient-to-b from-gray-50 to-white"
      >
        <span className="select-none text-[64px] leading-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105" aria-hidden>
          {product.emoji}
        </span>
        {off > 0 && (
          <span className="absolute left-0 top-3 rounded-r-md bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white">{off}% OFF</span>
        )}
      </button>
      <button
        onClick={() => setWished((w) => !w)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-gray-200/60 transition ${wished ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
      >
        <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
      </button>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <div className="mb-1 flex items-center gap-1 text-[11px] text-gray-500">
          <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden />
          <span className="font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
          <span>({compactCount(product.reviews)})</span>
        </div>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[14px] font-semibold leading-5 text-gray-900">{product.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{product.unit}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="leading-tight">
            <div className="text-[15px] font-bold text-gray-900">{formatINR(product.price)}</div>
            {off > 0 && <div className="text-xs text-gray-400 line-through">{formatINR(product.mrp)}</div>}
          </div>
          <QtyControl product={product} />
        </div>
      </div>
    </article>
  )
}
