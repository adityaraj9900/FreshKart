'use client'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { CheckCircle2, Package, Bike, Home, ClipboardCheck, MapPin, Phone, XCircle, ShoppingBag, ChevronDown } from 'lucide-react'
import Header from '@/components/Header'
import CartSidebar from '@/components/CartSidebar'
import { formatINR, shortId } from '@/lib/catalog'
import StatusPill from '@/components/StatusPill'

type OrderItem = { id: string; name: string; emoji: string; qty: number; price: number }
type Order = {
  id: string; status: string; createdAt: string; deliveredAt?: string | null; address: string; paymentMethod: string
  subtotal: number; discount: number; deliveryCharge: number; total: number; promoCode?: string | null
  items: OrderItem[]; deliveryBoy?: { name: string; phone: string } | null
}

const STEPS = [
  { key: 'confirmed', label: 'Order confirmed', icon: ClipboardCheck },
  { key: 'processing', label: 'Packing', icon: Package },
  { key: 'out_for_delivery', label: 'On the way', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: Home },
]
const ACTIVE = ['pending', 'confirmed', 'processing', 'out_for_delivery']

function OrdersContent() {
  const { status } = useSession()
  const router = useRouter()
  const newId = useSearchParams().get('new')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  const load = useCallback(() => fetch('/api/orders').then((r) => (r.ok ? r.json() : [])).then(setOrders).finally(() => setLoading(false)), [])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated') load()
  }, [status, router, load])

  // Keep live orders fresh without a manual reload.
  const hasActive = orders.some((o) => ACTIVE.includes(o.status))
  useEffect(() => {
    if (!hasActive) return
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [hasActive, load])

  const cancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'This order can no longer be cancelled'); return }
    toast.success('Order cancelled')
    load()
  }

  const active = orders.filter((o) => ACTIVE.includes(o.status))
  const past = orders.filter((o) => !ACTIVE.includes(o.status))

  return (
    <div className="min-h-screen">
      <Header onCartOpen={() => setCartOpen(true)} activeCategory="" />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My orders</h1>

        {newId && (
          <div role="status" className="mt-5 flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><CheckCircle2 size={24} /></span>
            <div>
              <h2 className="font-bold text-brand-900">Order placed. It’s on its way soon.</h2>
              <p className="text-sm text-brand-800/80">Order #{shortId(newId)} · We’ll update the status below as it moves.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-card" />)}</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-card">
            <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600"><ShoppingBag size={28} /></span>
            <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
            <p className="mt-1 text-sm text-gray-500">Your orders will show up here once you place one.</p>
            <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">Start shopping</Link>
          </div>
        ) : (
          <>
            {active.length > 0 && <Section title="In progress">{active.map((o) => <OrderCard key={o.id} order={o} highlight={o.id === newId} onCancel={cancel} />)}</Section>}
            {past.length > 0 && <Section title="Past orders">{past.map((o) => <OrderCard key={o.id} order={o} onCancel={cancel} />)}</Section>}
          </>
        )}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function OrderCard({ order, highlight, onCancel }: { order: Order; highlight?: boolean; onCancel: (id: string) => void }) {
  const [open, setOpen] = useState(!!highlight)
  const isActive = ACTIVE.includes(order.status)
  const cancelled = order.status === 'cancelled'
  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.key === order.status))
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0)
  const date = new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-card ${highlight ? 'ring-2 ring-brand-500' : ''}`}>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-900">Order #{shortId(order.id)}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-0.5 text-[13px] text-gray-500">{date} · {itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
          <div className="mt-3 flex -space-x-1.5">
            {order.items.slice(0, 6).map((i) => (
              <span key={i.id} title={`${i.name} × ${i.qty}`} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-white bg-gray-50 text-xl">{i.emoji}</span>
            ))}
            {order.items.length > 6 && <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600">+{order.items.length - 6}</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[15px] font-bold text-gray-900">{formatINR(order.total)}</div>
          <div className="text-xs text-gray-500">{order.paymentMethod}</div>
        </div>
      </div>

      {isActive && (
        <div className="border-t border-gray-100 px-5 py-5">
          <ol className="grid grid-cols-4">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex
              const Icon = s.icon
              return (
                <li key={s.key} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${i <= stepIndex ? 'bg-brand-500' : 'bg-gray-200'}`} aria-hidden />}
                  <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full ${done ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'} ${i === stepIndex ? 'ring-4 ring-brand-100' : ''}`}>
                    <Icon size={15} />
                  </span>
                  <span className={`mt-2 text-[11px] font-medium sm:text-xs ${done ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </li>
              )
            })}
          </ol>
          {order.deliveryBoy && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-card"><Bike size={17} /></span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{order.deliveryBoy.name}</div>
                  <div className="text-xs text-gray-500">Your delivery partner</div>
                </div>
              </div>
              {order.deliveryBoy.phone && <a href={`tel:${order.deliveryBoy.phone}`} aria-label={`Call ${order.deliveryBoy.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-card hover:bg-brand-50"><Phone size={16} /></a>}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-100">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {open ? 'Hide details' : 'View details'}
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="space-y-4 px-5 pb-5">
            <ul className="divide-y divide-gray-100 text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2.5 text-gray-700"><span className="text-lg">{i.emoji}</span>{i.name} <span className="text-gray-400">× {i.qty}</span></span>
                  <span className="font-medium text-gray-900">{formatINR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-[13px] text-gray-600">
              <div className="flex justify-between"><dt>Items total</dt><dd>{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-brand-700"><dt>Coupon{order.promoCode ? ` (${order.promoCode})` : ''}</dt><dd>−{formatINR(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery fee</dt><dd>{order.deliveryCharge === 0 ? 'FREE' : formatINR(order.deliveryCharge)}</dd></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900"><dt>Paid</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
            <div className="flex items-start gap-2 text-[13px] text-gray-600"><MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" /> {order.address}</div>
            {['pending', 'confirmed'].includes(order.status) && !cancelled && (
              <button onClick={() => onCancel(order.id)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"><XCircle size={15} /> Cancel order</button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" /></div>}>
      <OrdersContent />
    </Suspense>
  )
}
