'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LayoutDashboard, ShoppingCart, Package, Bike, Users, Ticket, RefreshCw, IndianRupee, Search, ArrowLeft, Star, ShoppingBag, Trash2, Check } from 'lucide-react'
import StatusPill from '@/components/StatusPill'
import { formatINR, shortId } from '@/lib/catalog'

type Tab = 'dashboard' | 'orders' | 'products' | 'delivery' | 'users' | 'promo'
const NAV: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'delivery', label: 'Delivery partners', icon: Bike },
  { key: 'users', label: 'Customers', icon: Users },
  { key: 'promo', label: 'Coupons', icon: Ticket },
]
const STATUSES = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']
const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

async function getJSON(url: string) {
  const r = await fetch(url)
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`)
  return r.json()
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const role = (session?.user as { role?: string } | undefined)?.role

  const loadData = useCallback(
    () =>
      Promise.all(['/api/orders', '/api/products', '/api/users', '/api/delivery', '/api/promo'].map(getJSON))
        .then(([o, p, u, d, pr]) => { setOrders(o); setProducts(p); setUsers(u); setPartners(d); setPromos(pr) })
        .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load dashboard data'))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated') {
      if (role !== 'admin') { toast.error('Admin access required'); router.replace('/'); return }
      loadData()
    }
  }, [status, role, router, loadData])

  const updateOrderStatus = async (id: string, next: string) => {
    const prev = orders
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: next } : o)))
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    if (!res.ok) { setOrders(prev); toast.error((await res.json()).error || 'Update failed'); return }
    toast.success(`Order #${shortId(id)} → ${label(next)}`)
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Could not delete product', { duration: 5000 }); return }
    setProducts((ps) => ps.filter((p) => p.id !== id))
    toast.success('Product deleted')
  }

  const saveStock = async (id: string, stock: number) => {
    const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) })
    if (!res.ok) { toast.error('Could not update stock'); return }
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock } : p)))
    toast.success('Stock updated')
  }

  const togglePartner = async (id: string, current: string) => {
    const next = current === 'active' ? 'offline' : 'active'
    const res = await fetch('/api/delivery', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: next }) })
    if (!res.ok) { toast.error('Could not update partner'); return }
    setPartners((ds) => ds.map((d) => (d.id === id ? { ...d, status: next } : d)))
  }

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'cancelled')
    return {
      revenue: live.reduce((s, o) => s + o.total, 0),
      orders: orders.length,
      aov: live.length ? live.reduce((s, o) => s + o.total, 0) / live.length : 0,
      customers: users.filter((u) => u.role === 'customer').length,
      activePartners: partners.filter((d) => d.status === 'active').length,
      byStatus: STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length] as const),
      lowStock: products.filter((p) => p.stock <= 10),
    }
  }, [orders, users, partners, products])

  if (status === 'loading' || role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" /></div>
  }

  const current = NAV.find((n) => n.key === tab)!

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><ShoppingBag size={18} strokeWidth={2.4} /></span>
          <span>
            <span className="block text-[17px] font-extrabold leading-tight tracking-tight">Fresh<span className="text-brand-600">Kart</span></span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400">Admin</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ key, label: l, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} aria-current={tab === key ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${tab === key ? 'bg-brand-50 text-brand-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={18} className={tab === key ? 'text-brand-600' : 'text-gray-400'} /> {l}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <div className="truncate text-sm font-semibold text-gray-900">{session?.user?.name}</div>
          <div className="truncate text-xs text-gray-500">{session?.user?.email}</div>
          <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"><ArrowLeft size={13} /> Back to store</Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 lg:px-8">
            <h1 className="text-lg font-bold text-gray-900">{current.label}</h1>
            <button onClick={() => { setLoading(true); loadData() }} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide lg:hidden">
            {NAV.map(({ key, label: l }) => (
              <button key={key} onClick={() => setTab(key)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium ${tab === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{l}</button>
            ))}
          </nav>
        </header>

        <div className="p-5 lg:p-8">
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Kpi icon={<IndianRupee size={18} />} label="Revenue" value={formatINR(stats.revenue)} sub={`Avg. order ${formatINR(stats.aov)}`} />
                <Kpi icon={<ShoppingCart size={18} />} label="Orders" value={stats.orders} sub={`${stats.byStatus.find(([s]) => s === 'delivered')?.[1] ?? 0} delivered`} />
                <Kpi icon={<Users size={18} />} label="Customers" value={stats.customers} sub="Registered accounts" />
                <Kpi icon={<Bike size={18} />} label="Active partners" value={`${stats.activePartners}/${partners.length}`} sub="Online now" />
              </div>
              <div className="grid gap-6 xl:grid-cols-3">
                <Card title="Recent orders" className="xl:col-span-2" action={<button onClick={() => setTab('orders')} className="text-sm font-semibold text-brand-700 hover:underline">View all</button>}>
                  <OrderTable orders={orders.slice(0, 8)} onStatusChange={updateOrderStatus} loading={loading} />
                </Card>
                <div className="space-y-6">
                  <Card title="Orders by status">
                    <ul className="space-y-3 p-5 pt-1">
                      {stats.byStatus.map(([s, n]) => (
                        <li key={s} className="flex items-center gap-3 text-sm">
                          <span className="w-28 shrink-0"><StatusPill status={s} /></span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${stats.orders ? (n / stats.orders) * 100 : 0}%` }} /></span>
                          <span className="w-6 text-right font-semibold tabular-nums text-gray-700">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card title="Low stock" action={<span className="text-xs text-gray-500">≤ 10 units</span>}>
                    {stats.lowStock.length === 0 ? <p className="px-5 pb-5 text-sm text-gray-500">All products are well stocked.</p> : (
                      <ul className="divide-y divide-gray-100 px-5 pb-2">
                        {stats.lowStock.slice(0, 6).map((p) => (
                          <li key={p.id} className="flex items-center justify-between py-2.5 text-sm"><span className="truncate">{p.emoji} {p.name}</span><span className="font-semibold text-red-600">{p.stock}</span></li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && <OrdersPanel orders={orders} onStatusChange={updateOrderStatus} loading={loading} />}
          {tab === 'products' && <ProductsPanel products={products} onDelete={deleteProduct} onStock={saveStock} />}

          {tab === 'delivery' && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((d) => (
                <div key={d.id} className="rounded-2xl bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{d.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.area} · {d.vehicleType}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.status === 'active' ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${d.status === 'active' ? 'bg-brand-500' : 'bg-gray-400'}`} />{d.status === 'active' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Deliveries" value={d.totalDeliveries} />
                    <Stat label="Rating" value={<span className="inline-flex items-center gap-0.5">{d.rating}<Star size={11} className="fill-amber-400 text-amber-400" /></span>} />
                    <Stat label="Earnings" value={formatINR(d.earnings)} />
                  </dl>
                  <button onClick={() => togglePartner(d.id, d.status)} className="mt-4 h-9 w-full rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {d.status === 'active' ? 'Set offline' : 'Set online'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <Card>
              <Table head={['Name', 'Email', 'Phone', 'Role', 'Orders', 'Joined']}>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${u.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                    <td className="px-5 py-3 tabular-nums text-gray-900">{u._count?.orders ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {tab === 'promo' && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {promos.map((p) => (
                <div key={p.id} className="rounded-2xl border border-dashed border-gray-300 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold tracking-wider text-brand-700">{p.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.active ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Discount" value={p.type === 'percent' ? `${p.discount}%` : formatINR(p.discount)} />
                    <Stat label="Min. order" value={formatINR(p.minOrder)} />
                    <Stat label="Used" value={p.usedCount} />
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon, label: l, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>{l}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{sub}</div>
    </div>
  )
}

function Card({ title, action, children, className = '' }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-white shadow-card ${className}`}>
      {title && <div className="flex items-center justify-between px-5 py-4"><h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>{action}</div>}
      {children}
    </section>
  )
}

function Stat({ label: l, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 px-2 py-2.5">
      <dd className="text-sm font-bold text-gray-900">{value}</dd>
      <dt className="text-[11px] text-gray-500">{l}</dt>
    </div>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-y border-gray-100 bg-gray-50/70 text-left text-xs font-medium text-gray-500">
          <tr>{head.map((h) => <th key={h} className="px-5 py-2.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex h-10 w-full max-w-xs items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-brand-500">
      <Search size={16} className="text-gray-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 text-sm outline-none" />
    </div>
  )
}

function OrderTable({ orders, onStatusChange, loading }: { orders: any[]; onStatusChange: (id: string, s: string) => void; loading?: boolean }) {
  if (!loading && orders.length === 0) return <p className="px-5 pb-6 text-sm text-gray-500">No orders to show.</p>
  return (
    <Table head={['Order', 'Customer', 'Items', 'Total', 'Status', 'Placed']}>
      {orders.map((o) => (
        <tr key={o.id} className="hover:bg-gray-50/70">
          <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-900">#{shortId(o.id)}</td>
          <td className="px-5 py-3"><div className="font-medium text-gray-900">{o.user?.name || '—'}</div><div className="text-xs text-gray-500">{o.user?.phone}</div></td>
          <td className="px-5 py-3 text-gray-600">{o.items?.reduce((s: number, i: any) => s + i.qty, 0)}</td>
          <td className="px-5 py-3 font-semibold text-gray-900">{formatINR(o.total)}</td>
          <td className="px-5 py-3">
            <select value={o.status} onChange={(e) => onStatusChange(o.id, e.target.value)} aria-label={`Status for order ${shortId(o.id)}`}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none focus:border-brand-500">
              {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </td>
          <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</td>
        </tr>
      ))}
    </Table>
  )
}

function OrdersPanel({ orders, onStatusChange, loading }: { orders: any[]; onStatusChange: (id: string, s: string) => void; loading: boolean }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const shown = orders.filter((o) => (filter === 'all' || o.status === filter) && (!q || `${o.id} ${o.user?.name ?? ''} ${o.user?.phone ?? ''}`.toLowerCase().includes(q.toLowerCase())))
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${filter === s ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {s === 'all' ? `All (${orders.length})` : `${label(s)} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search order, name or phone" />
      </div>
      <OrderTable orders={shown} onStatusChange={onStatusChange} loading={loading} />
    </Card>
  )
}

function ProductsPanel({ products, onDelete, onStock }: { products: any[]; onDelete: (id: string, name: string) => void; onStock: (id: string, stock: number) => void }) {
  const [q, setQ] = useState('')
  const shown = products.filter((p) => !q || `${p.name} ${p.brand} ${p.category?.name ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <Card>
      <div className="flex items-center justify-between gap-3 p-4">
        <span className="text-sm text-gray-500">{shown.length} of {products.length} products</span>
        <SearchBox value={q} onChange={setQ} placeholder="Search products" />
      </div>
      <Table head={['Product', 'Category', 'Price', 'MRP', 'Stock', 'Rating', '']}>
        {shown.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50/70">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-50 text-2xl">{p.emoji}</span>
                <div><div className="font-medium text-gray-900">{p.name}</div><div className="text-xs text-gray-500">{p.brand} · {p.unit}</div></div>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{p.category?.name}</td>
            <td className="px-5 py-3 font-semibold text-gray-900">{formatINR(p.price)}</td>
            <td className="px-5 py-3 text-gray-400 line-through">{formatINR(p.mrp)}</td>
            <td className="px-5 py-3"><StockEditor key={p.stock} value={p.stock} onSave={(n) => onStock(p.id, n)} /></td>
            <td className="px-5 py-3 text-gray-700"><span className="inline-flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{p.rating}</span></td>
            <td className="px-5 py-3 text-right">
              <button onClick={() => onDelete(p.id, p.name)} aria-label={`Delete ${p.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  )
}

function StockEditor({ value, onSave }: { value: number; onSave: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value))
  const n = Number(draft)
  const dirty = draft !== String(value) && Number.isInteger(n) && n >= 0
  const tone = value <= 10 ? 'border-red-200 bg-red-50 text-red-700' : value <= 50 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-900'
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (dirty) onSave(n) }} className="flex items-center gap-1">
      <input type="number" min={0} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Stock" className={`h-8 w-20 rounded-lg border px-2 text-sm font-medium tabular-nums outline-none focus:border-brand-500 ${tone}`} />
      {dirty && <button type="submit" aria-label="Save stock" className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Check size={15} /></button>}
    </form>
  )
}
