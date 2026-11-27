'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MapPin, Phone, Package, Bike, CheckCircle2, Navigation, Star, RefreshCw, Store, Inbox } from 'lucide-react'
import StatusPill from '@/components/StatusPill'
import { formatINR, shortId } from '@/lib/catalog'

const NEXT_STEP: Record<string, { next: string; label: string; icon: typeof Package }> = {
  confirmed: { next: 'processing', label: 'Start packing', icon: Package },
  processing: { next: 'out_for_delivery', label: 'Picked up, start trip', icon: Bike },
  out_for_delivery: { next: 'delivered', label: 'Mark as delivered', icon: CheckCircle2 },
}

export default function DeliveryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as { role?: string } | undefined)?.role
  const [orders, setOrders] = useState<any[]>([])
  const [me, setMe] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [tab, setTab] = useState<'active' | 'history'>('active')

  const load = useCallback(async () => {
    try {
      const [o, d] = await Promise.all([fetch('/api/orders').then((r) => r.json()), fetch('/api/delivery').then((r) => r.json())])
      setOrders(Array.isArray(o) ? o : [])
      if (Array.isArray(d)) setMe(d.find((x: any) => x.id === (session?.user as any)?.id) ?? null)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated') {
      if (role !== 'delivery' && role !== 'admin') { toast.error('Delivery partner access required'); router.replace('/'); return }
      load()
    }
  }, [status, role, router, load])

  const online = me ? me.status === 'active' : true

  const toggleOnline = async () => {
    if (!me) return
    const next = online ? 'offline' : 'active'
    const res = await fetch('/api/delivery', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    if (!res.ok) { toast.error('Could not update your status'); return }
    setMe({ ...me, status: next })
    toast(next === 'active' ? 'You’re online and can receive orders' : 'You’re offline')
  }

  const advance = async (id: string, next: string) => {
    setBusy(id)
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    setBusy(null)
    if (!res.ok) { toast.error((await res.json()).error || 'Update failed'); return }
    toast.success(next === 'delivered' ? 'Delivered. Nice work!' : 'Order updated')
    load()
  }

  const active = orders.filter((o) => ['confirmed', 'processing', 'out_for_delivery'].includes(o.status))
  const history = orders.filter((o) => o.status === 'delivered')
  const shown = tab === 'active' ? active : history

  if (status === 'loading' || (role !== 'delivery' && role !== 'admin')) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" /></div>
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-brand-800 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pb-20 pt-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-brand-200">Delivery partner</div>
            <div className="mt-0.5 text-lg font-bold">{session?.user?.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Back to store" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20"><Store size={18} /></Link>
            {me && (
              <button onClick={toggleOnline} role="switch" aria-checked={online} className="flex h-10 items-center gap-2.5 rounded-xl bg-white/10 pl-3 pr-2 text-sm font-semibold hover:bg-white/20">
                {online ? 'Online' : 'Offline'}
                <span className={`relative h-6 w-10 rounded-full transition ${online ? 'bg-brand-400' : 'bg-white/25'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${online ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-2xl px-4 pb-10">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 shadow-pop">
          <Metric label="Active now" value={active.length} />
          <Metric label="Delivered" value={me?.totalDeliveries ?? history.length} />
          <Metric label="Rating" value={me ? <span className="inline-flex items-center gap-1">{me.rating}<Star size={14} className="fill-amber-400 text-amber-400" /></span> : '—'} />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex rounded-xl bg-gray-200/70 p-1">
            {(['active', 'history'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${tab === t ? 'bg-white text-gray-900 shadow-card' : 'text-gray-600'}`}>
                {t === 'active' ? `Active (${active.length})` : `Completed (${history.length})`}
              </button>
            ))}
          </div>
          <button onClick={() => { setLoading(true); load() }} aria-label="Refresh orders" className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-white"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
        </div>

        <div className="mt-4 space-y-3">
          {loading && orders.length === 0 ? (
            [0, 1].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-card" />)
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-card">
              <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-gray-400"><Inbox size={24} /></span>
              <h3 className="font-semibold text-gray-900">{tab === 'active' ? 'No active orders' : 'No completed deliveries yet'}</h3>
              <p className="mt-1 text-sm text-gray-500">{tab === 'active' ? (online ? 'New orders assigned to you will appear here.' : 'Go online to start receiving orders.') : 'Delivered orders will be listed here.'}</p>
            </div>
          ) : (
            shown.map((o) => {
              const step = NEXT_STEP[o.status]
              const StepIcon = step?.icon
              return (
                <article key={o.id} className={`rounded-2xl bg-white p-5 shadow-card ${o.status === 'out_for_delivery' ? 'ring-2 ring-amber-300' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2"><span className="font-bold text-gray-900">#{shortId(o.id)}</span><StatusPill status={o.status} /></div>
                      <div className="mt-0.5 text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatINR(o.total)}</div>
                      <div className="text-xs text-gray-500">{o.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-700"><MapPin size={16} className="mt-0.5 shrink-0 text-red-500" /> {o.address}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700"><span className="font-semibold text-gray-900">{o.user?.name}</span>{o.user?.phone ? ` · ${o.user.phone}` : ''}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.items.map((i: any) => <span key={i.id} className="rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-700">{i.emoji} {i.name} × {i.qty}</span>)}
                  </div>

                  {tab === 'active' && (
                    <div className="mt-4 flex gap-2">
                      {step && (
                        <button onClick={() => advance(o.id, step.next)} disabled={busy === o.id} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                          {busy === o.id ? <RefreshCw size={17} className="animate-spin" /> : StepIcon && <StepIcon size={17} />} {step.label}
                        </button>
                      )}
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.address)}`} target="_blank" rel="noreferrer" aria-label="Open directions" className="grid h-12 w-12 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"><Navigation size={18} /></a>
                      {o.user?.phone && <a href={`tel:${o.user.phone}`} aria-label={`Call ${o.user.name}`} className="grid h-12 w-12 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"><Phone size={18} /></a>}
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
