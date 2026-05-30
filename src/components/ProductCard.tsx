'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { Heart, Star, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
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

export default function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const { items, addItem, updateQty } = useCartStore()
  const [wished, setWished] = useState(false)
  const cartItem = items.find((i) => i.id === product.id)
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, unit: product.unit, emoji: product.emoji, qty: 1, brand: product.brand })
    toast.success(`${product.emoji} ${product.name} added to cart!`)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col">
      {/* Image area */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-36 flex items-center justify-center cursor-pointer" onClick={() => onQuickView?.(product)}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{product.emoji}</span>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{discount}% OFF</span>
        )}
        {product.badge && (
          <span className="absolute top-2 right-8 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">{product.badge}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setWished(!wished); toast(wished ? 'Removed from wishlist' : `${product.emoji} Added to wishlist ❤️`) }}
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${wished ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
        >
          <Heart size={12} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{product.brand}</div>
        <div className="font-bold text-sm text-gray-800 leading-tight mb-0.5 line-clamp-2 cursor-pointer hover:text-green-600" onClick={() => onQuickView?.(product)}>
          {product.name}
        </div>
        <div className="text-xs text-gray-400 mb-1.5">{product.unit}</div>
        <div className="flex items-center gap-1 mb-3">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] text-gray-500">{product.rating} ({product.reviews > 999 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="font-black text-gray-900 text-sm">₹{product.price}</div>
            {discount > 0 && <div className="text-[10px] text-gray-400 line-through">₹{product.mrp}</div>}
          </div>
          {cartItem ? (
            <div className="flex items-center border-2 border-green-600 rounded-xl overflow-hidden">
              <button onClick={() => updateQty(product.id, cartItem.qty - 1)} className="bg-green-600 text-white w-7 h-7 flex items-center justify-center hover:bg-green-700 transition-colors">
                <Minus size={12} />
              </button>
              <span className="w-7 text-center text-sm font-bold text-gray-800">{cartItem.qty}</span>
              <button onClick={() => { updateQty(product.id, cartItem.qty + 1); toast.success(`${product.emoji} Added!`) }} className="bg-green-600 text-white w-7 h-7 flex items-center justify-center hover:bg-green-700 transition-colors">
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button onClick={handleAdd} className="flex items-center gap-1 border-2 border-green-600 text-green-600 rounded-xl px-3 py-1 text-xs font-bold hover:bg-green-600 hover:text-white transition-all">
              <Plus size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
