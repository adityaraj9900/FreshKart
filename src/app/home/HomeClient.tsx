'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Copy, X, Star, Truck, ShieldCheck, RotateCcw, MessageCircle, Send, SearchX } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import ProductCard, { QtyControl, discountPct, compactCount, type Product } from '@/components/ProductCard'
import CartSidebar from '@/components/CartSidebar'
import { CATEGORIES, categoryName, formatINR } from '@/lib/catalog'

type Promo = { id: string; code: string; description: string; minOrder: number; active: boolean }

const SORTS = [
  { value: 'default', label: 'Relevance' },
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Customer rating' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
]

export default function HomeClient() {
  const router = useRouter()
  const params = useSearchParams()
  const category = params.get('category') || 'all'
  const search = params.get('search') || ''

  const [sort, setSort] = useState('default')
  const [promos, setPromos] = useState<Promo[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<{ key: string; products: Product[]; error: boolean } | null>(null)
  const productsRef = useRef<HTMLElement>(null)

  // Loading is derived: we're loading whenever the latest result is for an older query.
  const requestKey = `${category}|${search}|${sort}|${reloadKey}`
  const loading = result?.key !== requestKey
  const error = !loading && !!result?.error
  const products = loading ? [] : result?.products ?? []

  useEffect(() => {
    const ctrl = new AbortController()
    const qs = new URLSearchParams({ sort })
    if (category !== 'all') qs.set('category', category)
    if (search) qs.set('search', search)
    fetch(`/api/products?${qs}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: Product[]) => setResult({ key: requestKey, products: data, error: false }))
      .catch((e) => { if (e?.name !== 'AbortError') setResult({ key: requestKey, products: [], error: true }) })
    return () => ctrl.abort()
  }, [requestKey, category, search, sort])

  useEffect(() => {
    fetch('/api/promo').then((r) => (r.ok ? r.json() : [])).then((all: Promo[]) => setPromos(all.filter((p) => p.active))).catch(() => {})
  }, [])

  const selectCategory = (slug: string) => {
    const next = slug === category ? 'all' : slug
    router.replace(next === 'all' ? '/' : `/?category=${next}`, { scroll: false })
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`${code} copied. Apply it in your cart.`)
    } catch {
      toast(`Use code ${code} at checkout`)
    }
  }

  const heading = search ? `Results for “${search}”` : category === 'all' ? 'All products' : categoryName(category)
  const browsing = !search && category === 'all'

  return (
    <div className="min-h-screen">
      <Header onCartOpen={() => setCartOpen(true)} activeCategory={search ? undefined : category} searchValue={search} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-5">
        {browsing && (
          <>
            <section className="grid gap-3 md:grid-cols-3 md:grid-rows-2">
              <div className="relative overflow-hidden rounded-3xl bg-brand-800 p-7 text-white md:col-span-2 md:row-span-2 md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-600/50 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-brand-400/25 blur-2xl" />
                <div className="relative max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
                    <Truck size={13} /> Free delivery on orders above ₹199
                  </span>
                  <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight md:text-[44px]">
                    Fresh groceries,
                    <br />
                    at your door in <span className="text-brand-300">10 minutes</span>.
                  </h1>
                  <p className="mt-3 text-[15px] leading-relaxed text-brand-100/90">
                    Farm-fresh produce, dairy and daily essentials from trusted brands, at honest prices.
                  </p>
                  <button
                    onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-800 shadow-sm transition hover:bg-brand-50"
                  >
                    Start shopping <ArrowRight size={17} />
                  </button>
                </div>
                <div className="pointer-events-none absolute bottom-6 right-8 hidden select-none gap-2 text-6xl lg:flex" aria-hidden>
                  <span className="-rotate-6">🥦</span><span className="translate-y-3">🍅</span><span className="rotate-6">🥕</span>
                </div>
              </div>
              <OfferTile onClick={() => selectCategory('dairy')} tone="bg-sky-100 text-sky-950" title="Dairy & eggs" sub="Delivered fresh every morning" emoji="🥛" />
              <OfferTile onClick={() => selectCategory('fruits')} tone="bg-amber-100 text-amber-950" title="Seasonal fruits" sub="Handpicked for sweetness" emoji="🥭" />
            </section>

            <section className="mt-10" aria-labelledby="cat-heading">
              <h2 id="cat-heading" className="text-xl font-bold tracking-tight text-gray-900">Shop by category</h2>
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-10">
                {CATEGORIES.map((cat) => (
                  <button key={cat.slug} onClick={() => selectCategory(cat.slug)} className="group flex flex-col items-center gap-2 text-center">
                    <span className={`grid aspect-square w-full place-items-center rounded-2xl ${cat.tint} text-4xl transition group-hover:-translate-y-0.5 group-hover:shadow-card`} aria-hidden>
                      {cat.emoji}
                    </span>
                    <span className="text-xs font-medium leading-tight text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {promos.length > 0 && (
              <section className="mt-10" aria-labelledby="offers-heading">
                <h2 id="offers-heading" className="text-xl font-bold tracking-tight text-gray-900">Coupons for you</h2>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {promos.map((p) => (
                    <div key={p.id} className="flex min-w-[260px] items-center justify-between gap-4 rounded-2xl border border-dashed border-brand-300 bg-white px-4 py-3.5">
                      <div>
                        <div className="font-mono text-sm font-bold tracking-wider text-brand-700">{p.code}</div>
                        <div className="mt-0.5 text-xs text-gray-600">{p.description}</div>
                        {p.minOrder > 0 && <div className="text-[11px] text-gray-400">Min. order {formatINR(p.minOrder)}</div>}
                      </div>
                      <button onClick={() => copyCode(p.code)} aria-label={`Copy code ${p.code}`} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100">
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section ref={productsRef} className="scroll-mt-36 pt-10" aria-labelledby="products-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="products-heading" className="text-xl font-bold tracking-tight text-gray-900">{heading}</h2>
              <p className="mt-0.5 text-sm text-gray-500">{loading ? 'Loading products…' : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}</p>
            </div>
            <div className="flex items-center gap-2">
              {(search || category !== 'all') && (
                <Link href="/" scroll={false} className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
                  <X size={15} /> Clear
                </Link>
              )}
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm font-medium text-gray-700 outline-none focus:border-brand-500"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white">
                  <div className="h-36 animate-pulse bg-gray-100" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
                    <div className="flex justify-between pt-3"><div className="h-5 w-12 animate-pulse rounded bg-gray-100" /><div className="h-9 w-[76px] animate-pulse rounded-lg bg-gray-100" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState icon={<SearchX size={28} />} title="We couldn’t load products" body="Check your connection and try again." action={<button onClick={() => setReloadKey((k) => k + 1)} className="text-sm font-semibold text-brand-700 hover:underline">Try again</button>} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title={search ? `No results for “${search}”` : 'Nothing here yet'}
              body="Try a different spelling, or browse a category instead."
              action={<Link href="/" className="inline-flex h-10 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">Browse all products</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-3 sm:grid-cols-3">
          {[
            { icon: <Truck size={20} />, title: 'Superfast delivery', body: 'Orders reach you from a store near you in minutes.' },
            { icon: <ShieldCheck size={20} />, title: 'Quality checked', body: 'Every item is checked before it is packed.' },
            { icon: <RotateCcw size={20} />, title: 'Easy returns', body: 'Not happy with an item? Ask for a replacement or refund.' },
          ].map((v) => (
            <div key={v.title} className="flex gap-3.5 rounded-2xl bg-white p-5 shadow-card">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">{v.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{v.title}</h3>
                <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">{v.body}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight">Fresh<span className="text-brand-600">Kart</span></div>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Groceries and daily essentials, delivered fast.</p>
          </div>
          <FooterCol title="Shop" links={CATEGORIES.slice(0, 5).map((c) => [`/?category=${c.slug}`, c.name])} />
          <FooterCol title="Account" links={[['/orders', 'My orders'], ['/login', 'Log in'], ['/register', 'Create account']]} />
          <FooterCol title="For partners" links={[['/admin', 'Admin dashboard'], ['/delivery', 'Delivery partner app']]} />
        </div>
        <div className="border-t border-gray-100 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FreshKart · Built by Aditya Kumar Mehta
        </div>
      </footer>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
      <Assistant />
    </div>
  )
}

function OfferTile({ title, sub, emoji, tone, onClick }: { title: string; sub: string; emoji: string; tone: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-3xl p-6 text-left ${tone}`}>
      <div>
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <p className="mt-0.5 text-sm opacity-75">{sub}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-semibold">Shop now <ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></span>
      <span className="absolute -bottom-2 right-4 select-none text-7xl transition group-hover:scale-105" aria-hidden>{emoji}</span>
    </button>
  )
}

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-gray-200/70 bg-white px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-gray-500">{icon}</span>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="text-sm text-gray-500 hover:text-brand-700">{label}</Link></li>
        ))}
      </ul>
    </div>
  )
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const off = discountPct(product)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="qv-title">
      <div className="absolute inset-0 animate-fade-in bg-gray-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl animate-pop-in overflow-hidden rounded-t-3xl bg-white shadow-pop sm:rounded-3xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm hover:text-gray-900">
          <X size={18} />
        </button>
        <div className="grid sm:grid-cols-2">
          <div className="relative grid h-56 place-items-center bg-gradient-to-b from-gray-50 to-gray-100 sm:h-full sm:min-h-[320px]">
            <span className="select-none text-[110px] leading-none drop-shadow" aria-hidden>{product.emoji}</span>
            {off > 0 && <span className="absolute left-0 top-4 rounded-r-md bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">{off}% OFF</span>}
          </div>
          <div className="flex flex-col p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.brand}</div>
            <h2 id="qv-title" className="mt-1 text-xl font-bold leading-snug text-gray-900">{product.name}</h2>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-500">
              <span>{product.unit}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)} ({compactCount(product.reviews)})</span>
            </div>
            {product.badge && <span className="mt-3 w-fit rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{product.badge}</span>}
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
            <div className="mt-auto pt-6">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatINR(product.price)}</span>
                {off > 0 && <><span className="text-sm text-gray-400 line-through">MRP {formatINR(product.mrp)}</span><span className="text-sm font-semibold text-sky-700">Save {formatINR(product.mrp - product.price)}</span></>}
              </div>
              <QtyControl product={product} size="lg" />
              <p className="mt-2 text-[11px] text-gray-400">Inclusive of all taxes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const BOT_RESPONSES: [string[], string][] = [
  [['hello', 'hi', 'hey'], 'Hi! I can help with offers, delivery times, payments and returns. What would you like to know?'],
  [['offer', 'coupon', 'code', 'discount'], 'Current coupons: FRESH10 (10% off above ₹200), NEWUSER50 (₹50 off above ₹150), SAVE100 (₹100 off above ₹500) and WEEKEND15 (15% off above ₹400). Apply them in your cart.'],
  [['deliver', 'time', 'fast'], 'Most orders arrive in about 10 minutes. Delivery is free on orders above ₹199; below that the fee is ₹25.'],
  [['pay', 'upi', 'card', 'cash'], 'You can pay by UPI, debit or credit card, net banking, or cash on delivery.'],
  [['return', 'refund', 'replace'], 'Not happy with an item? Ask for a replacement or refund within 24 hours of delivery.'],
  [['track', 'order', 'status'], 'You can follow every order, step by step, under My orders in the account menu.'],
]
const SUGGESTIONS = ['Offers', 'Delivery time', 'Payment options', 'Returns']

function Assistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    { from: 'bot', text: 'Hi! I’m the FreshKart assistant. Ask me about offers, delivery, payments or returns.' },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const send = (text: string) => {
    const msg = text.trim()
    if (!msg) return
    setMessages((m) => [...m, { from: 'user', text: msg }])
    setInput('')
    const lower = msg.toLowerCase()
    const hit = BOT_RESPONSES.find(([keys]) => keys.some((k) => lower.includes(k)))
    const reply = hit ? hit[1] : `I can’t answer that yet. Try the search bar for “${msg}”, or ask about offers, delivery, payments or returns.`
    setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: reply }]), 450)
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end">
      {open && (
        <div role="dialog" aria-label="FreshKart assistant" className="mb-3 flex h-[460px] w-[340px] max-w-[calc(100vw-2.5rem)] animate-pop-in flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-pop">
          <div className="flex items-center justify-between bg-brand-700 px-4 py-3.5 text-white">
            <div>
              <div className="text-sm font-bold">FreshKart assistant</div>
              <div className="flex items-center gap-1.5 text-xs text-brand-100"><span className="h-1.5 w-1.5 rounded-full bg-brand-300" /> Usually replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X size={17} /></button>
          </div>
          <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto bg-surface p-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${m.from === 'bot' ? 'rounded-tl-md bg-white text-gray-700 shadow-card' : 'rounded-tr-md bg-brand-600 text-white'}`}>{m.text}</div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">{s}</button>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2 border-t border-gray-100 p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" aria-label="Message" className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-brand-500" />
            <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-200"><Send size={16} /></button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-gray-900 text-white shadow-pop transition hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
