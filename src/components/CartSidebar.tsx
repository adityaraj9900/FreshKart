'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Zap, Tag, MapPin, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore, useCartTotals, FREE_DELIVERY_THRESHOLD } from '@/store/cartStore'
import { formatINR } from '@/lib/catalog'
import { useDeliveryLocation } from './Header'

export default function CartSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession()
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const promoCode = useCartStore((s) => s.promoCode)
  const { updateQty, applyPromo, removePromo, clearCart } = useCartStore.getState()
  const totals = useCartTotals()
  const [location] = useDeliveryLocation()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [applying, setApplying] = useState(false)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal)

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setApplying(true)
    setPromoError('')
    try {
      const res = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal: totals.subtotal }) })
      const data = await res.json()
      if (!res.ok) { setPromoError(data.error || 'This code cannot be applied'); return }
      applyPromo(code, data.discount)
      setPromoInput('')
      toast.success(`${code} applied`)
    } catch {
      setPromoError('Could not check this code. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleCheckout = async () => {
    if (!session) {
      onClose()
      router.push('/login?next=checkout')
      toast('Log in to place your order', { icon: '🔐' })
      return
    }
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })), promoCode, address: location, paymentMethod: 'UPI' }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Order failed')
      clearCart()
      onClose()
      router.push(`/orders?new=${order.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place the order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="absolute inset-0 animate-fade-in bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute bottom-0 right-0 top-0 flex w-full animate-slide-in flex-col bg-surface shadow-2xl sm:w-[420px]">
        <div className="flex items-center justify-between border-b border-gray-200/70 bg-white px-5 py-4">
          <h2 id="cart-title" className="text-lg font-bold text-gray-900">My cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-600"><ShoppingBag size={34} /></div>
            <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Add fresh produce and daily essentials to get started.</p>
            <button onClick={onClose} className="mt-6 h-11 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">Start shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <section className="rounded-2xl bg-white p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Zap size={18} fill="currentColor" /></span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Delivery in 10 minutes</div>
                    <div className="text-xs text-gray-500">Shipment of {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}</div>
                  </div>
                </div>
                <ul className="mt-4 divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-gray-100 bg-gray-50 text-3xl" aria-hidden>{item.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-[13px] font-medium leading-5 text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.unit}</div>
                        <div className="mt-0.5 text-[13px] font-bold text-gray-900">
                          {formatINR(item.price * item.qty)}
                          {item.mrp > item.price && <span className="ml-1.5 text-xs font-normal text-gray-400 line-through">{formatINR(item.mrp * item.qty)}</span>}
                        </div>
                      </div>
                      <div className="flex h-8 w-[76px] items-center justify-between rounded-lg bg-brand-600 text-sm font-bold text-white">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label={`Remove one ${item.name}`} className="grid h-full w-7 place-items-center rounded-l-lg hover:bg-brand-700"><Minus size={13} strokeWidth={3} /></button>
                        <span className="tabular-nums">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label={`Add one more ${item.name}`} className="grid h-full w-7 place-items-center rounded-r-lg hover:bg-brand-700"><Plus size={13} strokeWidth={3} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl bg-white p-4 shadow-card">
                {remaining > 0 ? (
                  <>
                    <p className="text-[13px] text-gray-700">Add <b>{formatINR(remaining)}</b> more for <b className="text-brand-700">free delivery</b></p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] font-medium text-brand-700">You’ve unlocked free delivery on this order.</p>
                )}
              </section>

              <section className="rounded-2xl bg-white p-4 shadow-card">
                {promoCode ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700"><Tag size={15} /></span>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{promoCode}</div>
                        <div className="text-xs text-brand-700">You save {formatINR(totals.discount)}</div>
                      </div>
                    </div>
                    <button onClick={removePromo} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo}>
                    <label htmlFor="promo" className="mb-2 block text-sm font-semibold text-gray-900">Apply coupon</label>
                    <div className="flex gap-2">
                      <input
                        id="promo"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                        placeholder="Enter code, e.g. FRESH10"
                        aria-invalid={!!promoError}
                        aria-describedby={promoError ? 'promo-error' : undefined}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal focus:border-brand-500"
                      />
                      <button type="submit" disabled={applying || !promoInput.trim()} className="h-10 rounded-xl px-4 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:text-gray-300">
                        {applying ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p id="promo-error" className="mt-1.5 text-xs text-red-600">{promoError}</p>}
                  </form>
                )}
              </section>

              <section className="rounded-2xl bg-white p-4 shadow-card">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Bill details</h3>
                <dl className="space-y-2 text-[13px]">
                  <Row label="Items total" value={<>{totals.mrpTotal > totals.subtotal && <span className="mr-1.5 text-gray-400 line-through">{formatINR(totals.mrpTotal)}</span>}{formatINR(totals.subtotal)}</>} />
                  {totals.discount > 0 && <Row label={`Coupon (${promoCode})`} value={<span className="text-brand-700">−{formatINR(totals.discount)}</span>} />}
                  <Row label="Delivery fee" value={totals.deliveryCharge === 0 ? <span className="font-semibold text-brand-700">FREE</span> : formatINR(totals.deliveryCharge)} />
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-2.5 text-[15px] font-bold text-gray-900">
                    <dt>Grand total</dt>
                    <dd>{formatINR(totals.total)}</dd>
                  </div>
                </dl>
                {totals.savings > 0 && (
                  <div className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">Your total savings: {formatINR(totals.savings)}</div>
                )}
              </section>
            </div>

            <div className="border-t border-gray-200/70 bg-white p-4">
              <div className="mb-3 flex items-center gap-2.5 text-[13px]">
                <MapPin size={16} className="shrink-0 text-gray-400" />
                <span className="text-gray-500">Delivering to</span>
                <span className="truncate font-semibold text-gray-900">{location}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={placing}
                className="flex h-14 w-full items-center justify-between rounded-xl bg-brand-600 px-4 text-white transition hover:bg-brand-700 disabled:opacity-70"
              >
                <span className="text-left leading-tight">
                  <span className="block text-[15px] font-bold">{formatINR(totals.total)}</span>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-white/80">Total</span>
                </span>
                <span className="flex items-center gap-1 text-[15px] font-bold">
                  {placing ? <><Loader2 size={18} className="animate-spin" /> Placing order…</> : <>{session ? 'Place order' : 'Log in to proceed'} <ChevronRight size={18} /></>}
                </span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-gray-600">
      <dt>{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  )
}
