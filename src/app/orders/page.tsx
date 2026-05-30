'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import CartSidebar from '@/components/CartSidebar'
import { Package, Zap, CheckCircle, Clock, Bike, Home } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={14} /> },
  processing: { label: 'Packing', color: 'bg-purple-100 text-purple-700', icon: <Package size={14} /> },
  out_for_delivery: { label: 'On the Way', color: 'bg-orange-100 text-orange-700', icon: <Bike size={14} /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <Clock size={14} /> },
}

function OrdersContent() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const newOrderId = searchParams.get('new')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/orders').then((r) => r.json()).then(setOrders).finally(() => setLoading(false))
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartOpen={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2"><Package className="text-green-600" /> My Orders</h1>

        {newOrderId && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="font-black text-green-700 text-lg mb-1">Order Placed Successfully!</h2>
            <div className="text-sm text-green-600 font-semibold mb-2">Order #{newOrderId.slice(-8)}</div>
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold"><Zap size={16} /> Arriving in 10 minutes!</div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here!</p>
            <Link href="/" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-700">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-black text-gray-800">Order #{order.id.slice(-8)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.icon} {sc.label}</span>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">{order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700">
                      <span>{item.emoji}</span> {item.name} × {item.qty}
                    </div>
                  ))}</div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="text-sm text-gray-500"><span className="font-semibold text-gray-700">₹{order.total}</span> · {order.paymentMethod} · {order.items.length} items</div>
                    {order.deliveryBoy && <div className="text-xs text-green-600 font-semibold flex items-center gap-1"><Bike size={12} /> {order.deliveryBoy.name}</div>}
                  </div>
                  {['confirmed', 'processing', 'out_for_delivery'].includes(order.status) && (
                    <div className="mt-3 bg-orange-50 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-orange-700 font-semibold">
                      <Zap size={12} /> Estimated delivery in <strong>~10 minutes</strong>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🛒</div></div>}><OrdersContent /></Suspense>
}
