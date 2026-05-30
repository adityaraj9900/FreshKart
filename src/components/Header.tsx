'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Heart, User, Search, MapPin, ChevronDown, Mic, X, Settings, Bike } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { slug: 'vegetables', name: 'Vegetables', emoji: '🥦' },
  { slug: 'fruits', name: 'Fruits', emoji: '🍎' },
  { slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛' },
  { slug: 'staples', name: 'Staples', emoji: '🌾' },
  { slug: 'snacks', name: 'Snacks', emoji: '🍿' },
  { slug: 'beverages', name: 'Beverages', emoji: '☕' },
  { slug: 'masalas', name: 'Masalas', emoji: '🌶️' },
  { slug: 'personal', name: 'Personal Care', emoji: '🧴' },
  { slug: 'household', name: 'Household', emoji: '🧹' },
  { slug: 'organic', name: 'Organic', emoji: '🌱' },
]

export default function Header({ onCartOpen, onSearch }: { onCartOpen: () => void; onSearch?: (q: string) => void }) {
  const { data: session } = useSession()
  const { itemCount } = useCartStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('Indiranagar, Bangalore')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('fk_location')
    if (saved) setLocation(saved)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
    if (onSearch) onSearch(searchQuery)
  }

  const handleVoiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { toast.error('Voice search not supported in this browser'); return }
    const recognition = new SR()
    recognition.lang = 'en-IN'
    toast('Listening... 🎤', { icon: '🎙️' })
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setSearchQuery(transcript)
      router.push(`/?search=${encodeURIComponent(transcript)}`)
    }
    recognition.start()
  }

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Announcement bar */}
      <div className="bg-green-600 text-white text-xs py-1.5 px-4 flex justify-center gap-8 overflow-hidden">
        <span>⚡ 10-Min Delivery Guaranteed</span>
        <span className="hidden sm:inline">🎁 Use FRESH10 for 10% OFF</span>
        <span className="hidden md:inline">🌱 100% Fresh Guarantee</span>
        <span className="hidden lg:inline">🚚 Free delivery above ₹199</span>
      </div>

      {/* Main header */}
      <div className="flex items-center gap-3 px-4 py-3 max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🛒</span>
          <div className="hidden sm:block">
            <div className="text-lg font-black text-green-600 leading-tight">FreshKart</div>
            <div className="text-[10px] text-orange-500 font-semibold leading-tight">10-Min Delivery</div>
          </div>
        </Link>

        {/* Location */}
        <button
          onClick={() => { const loc = prompt('Enter delivery location:', location); if (loc) { setLocation(loc); localStorage.setItem('fk_location', loc) } }}
          className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm hover:border-green-500 transition-colors shrink-0"
        >
          <MapPin size={14} className="text-green-600" />
          <div className="text-left">
            <div className="text-[10px] text-gray-400 leading-none">Delivering to</div>
            <div className="font-semibold text-gray-800 text-xs leading-tight max-w-[120px] truncate">{location}</div>
          </div>
          <ChevronDown size={12} className="text-gray-400" />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex rounded-xl border-2 border-gray-200 focus-within:border-green-500 overflow-hidden transition-colors">
          <button type="button" onClick={handleVoiceSearch} className="px-3 text-gray-400 hover:text-green-600 transition-colors">
            <Mic size={16} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, vegetables, dairy..."
            className="flex-1 py-2.5 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="px-2 text-gray-400 hover:text-red-500">
              <X size={14} />
            </button>
          )}
          <button type="submit" className="bg-green-600 text-white px-4 text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5">
            <Search size={15} /> <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/admin" className="hidden lg:flex items-center gap-1 border border-purple-200 text-purple-600 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-purple-50 transition-colors">
            <Settings size={14} /> Admin
          </Link>
          <Link href="/delivery" className="hidden lg:flex items-center gap-1 border border-orange-200 text-orange-500 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-orange-50 transition-colors">
            <Bike size={14} /> Delivery
          </Link>
          <button
            onClick={onCartOpen}
            className="flex items-center gap-1.5 bg-green-600 text-white rounded-xl px-3 py-2 text-sm font-semibold hover:bg-green-700 transition-colors relative"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:border-green-500 transition-colors">
              <User size={16} className="text-gray-600" />
              <span className="hidden sm:inline text-gray-700 max-w-[70px] truncate">{session?.user?.name?.split(' ')[0] || 'Login'}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="font-semibold text-sm">{session?.user?.name || 'Guest User'}</div>
                  <div className="text-xs text-gray-400 truncate">{session?.user?.email || 'Not logged in'}</div>
                </div>
                {session ? (
                  <>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>📦 My Orders</Link>
                    {(session.user as any)?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>⚙️ Admin Panel</Link>
                    )}
                    {(session.user as any)?.role === 'delivery' && (
                      <Link href="/delivery" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>🏍️ Delivery Panel</Link>
                    )}
                    <button onClick={() => { signOut(); setShowUserMenu(false) }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">🚪 Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>🔑 Login</Link>
                    <Link href="/register" className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-semibold" onClick={() => setShowUserMenu(false)}>✨ Register & Get ₹50 OFF</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-gray-100 px-4 max-w-screen-xl mx-auto">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          <Link href="/" className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 whitespace-nowrap transition-all">
            🛒 All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/?category=${cat.slug}`} className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 whitespace-nowrap transition-all">
              {cat.emoji} {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
