'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Zap, Phone, MapPin, CheckCircle, Package, Bike } from 'lucide-react'

export default function DeliveryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [tab, setTab] = useState<'active' | 'history'>('active')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'delivery' && role !== 'admin') { router.push('/'); toast.error('Delivery partner access required'); return }
      loadOrders()
    }
  }, [status])

  const loadOrders = () => {
    setLoading(true)
    fetch('/api/orders').then((r) => r.json()).then(setOrders).finally(() => setLoading(false))
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    toast.success(newStatus === 'delivered' ? '🎉 Order delivered! Great job!' : `Order updated to ${newStatus}`)
    loadOrders()
  }

  const active = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
  const history = orders.filter((o) => o.status === 'delivered')
  const todayEarnings = history.length * 25 + 450

  const STEP_CONFIG: Record<string, { next: string; label: string; color: string }> = {
    confirmed: { next: 'processing', label: '📦 Start Packing', color: 'bg-blue-600' },
    processing: { next: 'out_for_delivery', label: '🏍️ Pick Up Order', color: 'bg-orange-500' },
    out_for_delivery: { next: 'delivered', label: '✅ Mark Delivered', color: 'bg-green-600' },
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏍️</div>
          <div>
            <div className="font-bold">{session?.user?.name}</div>
            <div className="flex items-center gap-1.5 text-xs opacity-90">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setIsOnline(!isOnline); toast(isOnline ? 'You are now Offline' : 'You are now Online! 🟢') }} className={`text-xs font-bold border-2 rounded-xl px-3 py-1.5 transition-all ${isOnline ? 'border-white/40 text-white' : 'bg-white text-green-700 border-white'}`}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
          <Link href="/" className="text-xs font-bold border border-white/30 rounded-xl px-3 py-1.5 hover:bg-white/20">Store</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-4">
        {[['🏍️', active.length, "Today's Active"], ['✅', history.length, 'Delivered'], ['💰', `₹${todayEarnings}`, 'Earnings'], ['⭐', '4.7', 'My Rating']].map(([icon, val, label]) => (
          <div key={label as string} className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <div className="text-xl mb-0.5">{icon}</div>
            <div className="font-black text-gray-800 text-sm">{val}</div>
            <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {(['active', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500'}`}>
            {t === 'active' ? `Active (${active.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="px-4 space-y-3 pb-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)
        ) : tab === 'active' ? (
          active.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="font-bold text-gray-700">No active orders</h3>
              <p className="text-gray-400 text-sm mt-1">{isOnline ? 'Waiting for new orders...' : 'Go online to receive orders'}</p>
            </div>
          ) : active.map((order) => {
            const step = STEP_CONFIG[order.status]
            return (
              <div key={order.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${order.status === 'out_for_delivery' ? 'border-orange-300' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-gray-800">#{order.id.slice(-8)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{order.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{order.address}</span>
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">👤 {order.user?.name} · 📞 {order.user?.phone}</div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {order.items.map((item: any) => (
                    <span key={item.id} className="text-xs bg-gray-50 rounded-lg px-2 py-1 text-gray-600">{item.emoji} {item.name} ×{item.qty}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-center bg-gray-50 rounded-xl py-2 font-black text-green-700">₹{order.total}</div>
                  {step && <button onClick={() => updateStatus(order.id, step.next)} className={`flex-1 ${step.color} text-white rounded-xl py-2 font-bold text-sm hover:opacity-90 transition-opacity`}>{step.label}</button>}
                  <button onClick={() => toast(`Calling ${order.user?.name}...`, { icon: '📞' })} className="border border-gray-200 rounded-xl px-3 py-2 hover:border-green-400 transition-colors"><Phone size={16} className="text-gray-500" /></button>
                </div>
                {order.status === 'out_for_delivery' && (
                  <div className="mt-3 bg-green-50 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700 font-semibold">
                    <Zap size={12} /> Navigate to delivery address for fastest route
                  </div>
                )}
              </div>
            )
          })
        ) : (
          history.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm"><div className="text-5xl mb-3">📋</div><h3 className="font-bold text-gray-700">No delivery history</h3></div>
          ) : history.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">#{order.id.slice(-8)}</div>
                  <div className="text-xs text-gray-400">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600">₹{order.total}</div>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✅ Delivered</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
