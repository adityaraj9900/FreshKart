'use client'
import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Search, MapPin, ChevronDown, Mic, X, User, Package, LayoutDashboard, Bike, LogOut, LogIn, UserPlus, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartTotals } from '@/store/cartStore'
import { CATEGORIES, formatINR } from '@/lib/catalog'

const DEFAULT_LOCATION = 'Indiranagar, Bangalore'

const LOCATION_KEY = 'fk_location'
const LOCATION_EVENT = 'fk-location-change'

function subscribeLocation(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(LOCATION_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(LOCATION_EVENT, onChange)
  }
}

/** Saved delivery location, shared by the header and the cart and kept in sync across tabs. */
export function useDeliveryLocation() {
  const location = useSyncExternalStore(subscribeLocation, () => localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION, () => DEFAULT_LOCATION)
  const setLocation = (loc: string) => {
    localStorage.setItem(LOCATION_KEY, loc)
    window.dispatchEvent(new Event(LOCATION_EVENT))
  }
  return [location, setLocation] as const
}

const noopSubscribe = () => () => {}

interface HeaderProps {
  onCartOpen: () => void
  activeCategory?: string
  searchValue?: string
}

export default function Header({ onCartOpen, activeCategory, searchValue = '' }: HeaderProps) {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const { itemCount, total } = useCartTotals()
  const router = useRouter()
  const [query, setQuery] = useState(searchValue)
  const [prevSearch, setPrevSearch] = useState(searchValue)
  if (prevSearch !== searchValue) {
    // Keep the box in sync when the URL search changes (back/forward, clear).
    setPrevSearch(searchValue)
    setQuery(searchValue)
  }
  const [location, setLocation] = useDeliveryLocation()
  const [locOpen, setLocOpen] = useState(false)
  const [locDraft, setLocDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Cart contents come from localStorage, so only show them after hydration.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const menuRef = useRef<HTMLDivElement>(null)
  const locRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setLocOpen(false) }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/')
  }

  const voiceSearch = () => {
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { toast.error('Voice search is not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-IN'
    toast('Listening…', { icon: '🎙️' })
    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript
      setQuery(transcript)
      router.push(`/?search=${encodeURIComponent(transcript)}`)
    }
    rec.start()
  }

  const saveLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const loc = locDraft.trim()
    if (!loc) return
    setLocation(loc)
    setLocOpen(false)
    toast.success('Delivery location updated')
  }

  const searchForm = (
    <form onSubmit={submitSearch} role="search" className="group flex h-11 flex-1 items-center rounded-xl bg-gray-100 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-brand-500">
      <Search size={18} className="ml-3.5 shrink-0 text-gray-400" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for milk, atta, vegetables…"
        aria-label="Search products"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button type="button" onClick={() => { setQuery(''); if (searchValue) router.push('/') }} aria-label="Clear search" className="p-2 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      )}
      <button type="button" onClick={voiceSearch} aria-label="Search by voice" className="mr-1.5 rounded-lg p-2 text-gray-500 hover:bg-gray-200/70 hover:text-brand-700">
        <Mic size={17} />
      </button>
    </form>
  )

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_1px_0_rgb(0_0_0/0.06),0_4px_16px_-8px_rgb(0_0_0/0.12)]' : 'border-b border-gray-100'}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="FreshKart home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShoppingBag size={19} strokeWidth={2.4} />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-[19px] font-extrabold tracking-tight text-gray-900">Fresh<span className="text-brand-600">Kart</span></span>
          </span>
        </Link>

        <div className="relative hidden md:block" ref={locRef}>
          <button
            onClick={() => { setLocDraft(location); setLocOpen((o) => !o) }}
            aria-expanded={locOpen}
            className="flex max-w-[220px] items-center gap-2 rounded-xl px-2.5 py-1.5 text-left hover:bg-gray-50"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Zap size={16} fill="currentColor" /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold text-gray-900">Delivery in 10 minutes</span>
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <span className="truncate">{location}</span>
                <ChevronDown size={13} className="shrink-0" />
              </span>
            </span>
          </button>
          {locOpen && (
            <form onSubmit={saveLocation} className="absolute left-0 top-full mt-2 w-80 animate-pop-in rounded-2xl border border-gray-100 bg-white p-4 shadow-pop">
              <label htmlFor="fk-location" className="text-sm font-semibold text-gray-900">Delivery location</label>
              <p className="mb-3 mt-0.5 text-xs text-gray-500">Enter your area or full address.</p>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-brand-500">
                <MapPin size={16} className="text-gray-400" />
                <input id="fk-location" autoFocus value={locDraft} onChange={(e) => setLocDraft(e.target.value)} className="h-10 flex-1 text-sm outline-none" placeholder="e.g. HSR Layout, Bangalore" />
              </div>
              <button type="submit" className="mt-3 h-10 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700">Save location</button>
            </form>
          )}
        </div>

        <div className="hidden flex-1 md:flex">{searchForm}</div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <User size={19} />
              <span className="hidden max-w-[90px] truncate lg:inline">{session?.user?.name?.split(' ')[0] || 'Login'}</span>
              <ChevronDown size={14} className="hidden text-gray-400 lg:block" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-60 animate-pop-in overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-pop">
                {session ? (
                  <>
                    <div className="border-b border-gray-100 px-4 pb-3 pt-2">
                      <div className="truncate text-sm font-semibold text-gray-900">{session.user?.name}</div>
                      <div className="truncate text-xs text-gray-500">{session.user?.email}</div>
                    </div>
                    <MenuLink href="/orders" icon={<Package size={16} />} onClick={() => setMenuOpen(false)}>My orders</MenuLink>
                    {role === 'admin' && <MenuLink href="/admin" icon={<LayoutDashboard size={16} />} onClick={() => setMenuOpen(false)}>Admin dashboard</MenuLink>}
                    {(role === 'delivery' || role === 'admin') && <MenuLink href="/delivery" icon={<Bike size={16} />} onClick={() => setMenuOpen(false)}>Delivery partner app</MenuLink>}
                    <button role="menuitem" onClick={() => { setMenuOpen(false); signOut() }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 pb-2 pt-2 text-xs text-gray-500">Log in to track orders and save your details.</div>
                    <MenuLink href="/login" icon={<LogIn size={16} />} onClick={() => setMenuOpen(false)}>Log in</MenuLink>
                    <MenuLink href="/register" icon={<UserPlus size={16} />} onClick={() => setMenuOpen(false)}>Create account</MenuLink>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onCartOpen}
            aria-label={`Open cart, ${itemCount} items`}
            className="flex h-11 items-center gap-2.5 rounded-xl bg-brand-600 pl-3 pr-3.5 text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <ShoppingBag size={19} />
            {mounted && itemCount > 0 ? (
              <span className="text-left leading-tight">
                <span className="block text-xs font-medium text-white/85">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                <span className="block text-sm font-bold">{formatINR(total)}</span>
              </span>
            ) : (
              <span className="text-sm font-semibold">Cart</span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">{searchForm}</div>

      <nav aria-label="Categories" className="mx-auto max-w-7xl px-4">
        <div className="-mb-px flex gap-1 overflow-x-auto scrollbar-hide">
          {[{ slug: 'all', name: 'All' }, ...CATEGORIES].map((cat) => {
            const active = (activeCategory || 'all') === cat.slug
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/?category=${cat.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors ${active ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}

function MenuLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link role="menuitem" href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
      <span className="text-gray-400">{icon}</span>
      {children}
    </Link>
  )
}
