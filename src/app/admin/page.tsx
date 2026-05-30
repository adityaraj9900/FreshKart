'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'orders', label: 'Orders', icon: '🛒' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'delivery', label: 'Delivery Boys', icon: '🏍️' },
  { key: 'users', label: 'Customers', icon: '👥' },
  { key: 'promo', label: 'Promo Codes', icon: '🏷️' },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([])
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'admin') { router.push('/'); toast.error('Admin access required'); return }
      loadData()
    }
  }, [status])

  const loadData = async () => {
    setLoading(true)
    const [o, p, u, d, pr] = await Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/delivery').then((r) => r.json()),
      fetch('/api/promo').then((r) => r.json()),
    ])
    setOrders(o); setProducts(p); setUsers(u); setDeliveryBoys(d); setPromos(pr)
    setLoading(false)
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    toast.success(`Order status updated to ${status}`)
    loadData()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    toast.success('Product deleted')
    loadData()
  }

  const stats = {
    revenue: orders.reduce((s: number, o: any) => s + o.total, 0),
    totalOrders: orders.length,
    customers: users.length,
    activeDelivery: deliveryBoys.filter((d: any) => d.status === 'active').length,
  }

  if (loading && status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-4xl mb-2">🛒</div><div className="text-gray-500 font-semibold">Loading FreshKart Admin...</div></div></div>

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="text-xl font-black text-green-400">🛒 FreshKart</Link>
          <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.key ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <div className="font-semibold text-gray-300">{session?.user?.name}</div>
          <Link href="/" className="hover:text-green-400 mt-1 block">← Back to Store</Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-black text-lg text-gray-800 capitalize">{tab}</h1>
          <button onClick={loadData} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">↻ Refresh</button>
        </div>

        <div className="p-6">
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[['💰', 'Revenue', `₹${stats.revenue.toLocaleString('en-IN')}`, 'bg-green-500'], ['🛒', 'Orders', stats.totalOrders, 'bg-blue-500'], ['👥', 'Customers', stats.customers, 'bg-purple-500'], ['🏍️', 'Active Riders', stats.activeDelivery, 'bg-orange-500']].map(([icon, label, val, bg]) => (
                  <div key={label as string} className={`${bg} text-white rounded-2xl p-5`}>
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-2xl font-black">{val}</div>
                    <div className="text-sm opacity-80">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-800 mb-4">Recent Orders</h3>
                <OrderTable orders={orders.slice(0, 10)} onStatusChange={updateOrderStatus} />
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <OrderTable orders={orders} onStatusChange={updateOrderStatus} />
            </div>
          )}

          {/* Products */}
          {tab === 'products' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <tr>{['Product', 'Category', 'Brand', 'Price', 'MRP', 'Stock', 'Rating', ''].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-2"><span className="text-2xl">{p.emoji}</span><div><div className="font-semibold text-gray-800">{p.name}</div><div className="text-xs text-gray-400">{p.unit}</div></div></td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.category?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                      <td className="px-4 py-3 font-bold">₹{p.price}</td>
                      <td className="px-4 py-3 text-gray-400 line-through">₹{p.mrp}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock > 50 ? 'bg-green-100 text-green-700' : p.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span></td>
                      <td className="px-4 py-3">⭐ {p.rating}</td>
                      <td className="px-4 py-3"><button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 text-xs border border-red-200 hover:border-red-400 rounded-lg px-2 py-1 transition-colors">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Delivery */}
          {tab === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryBoys.map((d: any) => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="text-center mb-4"><div className="text-4xl mb-2">🏍️</div><div className="font-black text-gray-800">{d.name}</div><div className="text-sm text-gray-400">{d.area}</div></div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    {[['Today', d.todayDeliveries], ['Total', d.totalDeliveries], ['Rating', `⭐${d.rating}`], ['Earnings', `₹${d.earnings.toLocaleString('en-IN')}`]].map(([label, val]) => (
                      <div key={label as string} className="bg-gray-50 rounded-xl py-2"><div className="font-black text-gray-800 text-sm">{val}</div><div className="text-xs text-gray-400">{label}</div></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                    <button onClick={async () => { await fetch('/api/delivery', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id, status: d.status === 'active' ? 'offline' : 'active' }) }); toast.success('Status updated'); loadData() }} className="text-xs border border-gray-200 rounded-lg px-3 py-1 hover:border-green-400 hover:text-green-600 transition-colors">{d.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <tr>{['Name', 'Email', 'Phone', 'Role', 'Orders', 'Joined'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                      <td className="px-4 py-3 font-semibold">{u._count?.orders || 0}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Promos */}
          {tab === 'promo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promos.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:border-green-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xl tracking-wider text-green-600">{p.code}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span><strong className="text-gray-700">{p.type === 'percent' ? `${p.discount}%` : `₹${p.discount}`}</strong> discount</span>
                    <span><strong className="text-gray-700">₹{p.minOrder}</strong> min order</span>
                    <span><strong className="text-gray-700">{p.usedCount}</strong> used</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderTable({ orders, onStatusChange }: { orders: any[]; onStatusChange: (id: string, status: string) => void }) {
  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600', confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
          <tr>{['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Time'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((o: any) => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs font-bold">#{o.id.slice(-8)}</td>
              <td className="px-4 py-3"><div className="font-semibold">{o.user?.name || 'N/A'}</div><div className="text-xs text-gray-400">{o.user?.phone}</div></td>
              <td className="px-4 py-3 text-gray-500">{o.items?.length} items</td>
              <td className="px-4 py-3 font-bold">₹{o.total}</td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => onStatusChange(o.id, e.target.value)} className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[o.status] || 'bg-gray-100'}`}>
                  {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
