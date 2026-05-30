'use client'
import { useState } from 'react'
import { X, ShoppingCart, Minus, Plus, Trash2, Zap, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CartSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession()
  const { items, updateQty, removeItem, subtotal, deliveryCharge, total, itemCount, promoCode, discount, applyPromo, removePromo, clearCart } = useCartStore()
  const [promoInput, setPromoInput] = useState('')
  const [placing, setPlacing] = useState(false)
  const router = useRouter()

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    const res = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: promoInput.toUpperCase(), subtotal }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    applyPromo(promoInput.toUpperCase(), data.discount)
    toast.success(`✅ ${promoInput.toUpperCase()} applied! ${data.description}`)
    setPromoInput('')
  }

  const handleCheckout = async () => {
    if (!session) { onClose(); router.push('/login'); toast('Please login to checkout', { icon: '🔐' }); return }
    if (!items.length) return
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, subtotal, discount, deliveryCharge, total, promoCode, address: 'Indiranagar, Bangalore - 560038', paymentMethod: 'UPI' }),
      })
      const order = await res.json()
      clearCart()
      onClose()
      router.push(`/orders?new=${order.id}`)
      toast.success(`🎉 Order #${order.id.slice(-6)} placed! Arrives in 10 mins!`)
    } catch {
      toast.error('Failed to place order. Try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart size={20} className="text-green-600" /> Cart ({itemCount})</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:border-red-300 hover:text-red-500 transition-colors"><X size={16} /></button>
        </div>

        {/* Delivery info */}
        <div className="px-5 py-3 bg-green-50 border-b border-green-100">
          <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-2">
            <Zap size={14} /> Delivery in <strong>10 minutes</strong>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / 199) * 100)}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {subtotal >= 199 ? '🎉 You have FREE delivery!' : `Add ₹${199 - subtotal} more for FREE delivery`}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {!items.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4">🛒</span>
              <h3 className="font-bold text-gray-800 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-400 mb-4">Add items to get started!</p>
              <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">Browse Products</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.unit}</div>
                  <div className="font-bold text-green-700 text-sm">₹{item.price * item.qty}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center border-2 border-green-600 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="bg-green-600 text-white w-6 h-6 flex items-center justify-center hover:bg-green-700"><Minus size={10} /></button>
                    <span className="w-7 text-center text-xs font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="bg-green-600 text-white w-6 h-6 flex items-center justify-center hover:bg-green-700"><Plus size={10} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            {/* Promo */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-green-700 flex items-center gap-1"><Tag size={12} /> {promoCode} applied!</span>
                <button onClick={removePromo} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Promo code" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500" onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()} />
                <button onClick={handleApplyPromo} className="bg-green-100 text-green-700 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-green-200">Apply</button>
              </div>
            )}
            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Discount ({promoCode})</span><span>-₹{discount}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600 font-semibold">FREE 🎉</span> : `₹${deliveryCharge}`}</span></div>
              <div className="flex justify-between font-black text-base border-t pt-2"><span>Total</span><span>₹{total}</span></div>
            </div>
            {discount > 0 && <div className="text-center text-xs text-green-600 font-semibold bg-green-50 rounded-lg py-1.5">🎉 You save ₹{discount} on this order!</div>}
            <button onClick={handleCheckout} disabled={placing} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2">
              <Zap size={16} /> {placing ? 'Placing Order...' : `Checkout · ₹${total}`}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
