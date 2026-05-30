'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import CartSidebar from '@/components/CartSidebar'
import { Zap, Star, Shield, Leaf, ChevronLeft, ChevronRight, Bot, Send, X } from 'lucide-react'
import Link from 'next/link'

const BANNERS = [
  { bg: 'from-green-500 to-emerald-400', title: 'Fresh Vegetables', sub: 'Farm to doorstep in 10 mins', offer: 'Up to 40% OFF', emoji: '🥦🍅🥕', cat: 'vegetables' },
  { bg: 'from-purple-500 to-indigo-400', title: 'Dairy & Eggs', sub: 'Fresh daily delivery', offer: 'Buy 2 Get 1 FREE', emoji: '🥛🧀🥚', cat: 'dairy' },
  { bg: 'from-orange-400 to-red-400', title: 'Snacks & Beverages', sub: 'Stock up for parties', offer: '30% OFF on combos', emoji: '🍿☕🥤', cat: 'snacks' },
]

const CATEGORIES = [
  { slug: 'vegetables', name: 'Vegetables', emoji: '🥦', color: 'bg-green-50 border-green-200' },
  { slug: 'fruits', name: 'Fruits', emoji: '🍎', color: 'bg-red-50 border-red-200' },
  { slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛', color: 'bg-blue-50 border-blue-200' },
  { slug: 'staples', name: 'Staples', emoji: '🌾', color: 'bg-yellow-50 border-yellow-200' },
  { slug: 'snacks', name: 'Snacks', emoji: '🍿', color: 'bg-purple-50 border-purple-200' },
  { slug: 'beverages', name: 'Beverages', emoji: '☕', color: 'bg-teal-50 border-teal-200' },
  { slug: 'masalas', name: 'Masalas', emoji: '🌶️', color: 'bg-red-50 border-red-200' },
  { slug: 'personal', name: 'Personal Care', emoji: '🧴', color: 'bg-sky-50 border-sky-200' },
  { slug: 'household', name: 'Household', emoji: '🧹', color: 'bg-gray-50 border-gray-200' },
  { slug: 'organic', name: 'Organic', emoji: '🌱', color: 'bg-green-50 border-green-200' },
]

const BOT_RESPONSES: Record<string, string> = {
  hello: 'Hello! 👋 Welcome to FreshKart! I can help you find products, check offers, track orders, or suggest recipes. What do you need?',
  hi: 'Hi there! 🌟 How can I help you with your grocery shopping today?',
  offers: '🎉 Today\'s offers:\n• 40% OFF on fresh vegetables\n• Use FRESH10 for 10% off\n• SAVE100 for ₹100 off on orders above ₹500\n• Free delivery above ₹199!',
  delivery: '⚡ We deliver in just 10 minutes! Available 6 AM – 11 PM. Free delivery on orders above ₹199.',
  payment: '💳 We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery.',
  return: '↩️ Easy 24-hour returns! Not happy with quality? We\'ll replace or refund — no questions asked.',
  fresh: '✅ All products are sourced directly from farms. Vegetables arrive within hours of harvest. 100% freshness guaranteed!',
  recipe: '🍳 Tell me what ingredients you have and I\'ll suggest recipes! Try "recipe with paneer" or "recipe with tomato".',
  help: 'I can help with:\n🔍 Finding products\n💰 Offers & deals\n📦 Order tracking\n🍳 Recipe ideas\n🚚 Delivery info\n↩️ Returns\n\nJust ask!',
}

export default function HomeClient() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [banner, setBanner] = useState(0)
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState('default')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([{ from: 'bot', text: 'Hello! 👋 I\'m your AI shopping assistant. Ask me about products, deals, or delivery!' }])
  const [chatInput, setChatInput] = useState('')
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const search = searchParams.get('search') || ''
    const cat = searchParams.get('category') || category
    const url = `/api/products?category=${cat === 'all' ? '' : cat}&search=${search}&sort=${sort}`
    const res = await fetch(url)
    setProducts(await res.json())
    setLoading(false)
  }, [category, sort, searchParams])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { const t = setInterval(() => setBanner((b) => (b + 1) % BANNERS.length), 5000); return () => clearInterval(t) }, [])

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMessages((prev) => [...prev, { from: 'user', text: msg }])
    setChatInput('')
    setTimeout(() => {
      const key = Object.keys(BOT_RESPONSES).find((k) => msg.toLowerCase().includes(k))
      const reply = key ? BOT_RESPONSES[key] : `I found "${msg}" — try searching in the search bar above! 🔍 Or ask me about offers, delivery, or recipes.`
      setChatMessages((prev) => [...prev, { from: 'bot', text: reply }])
    }, 600)
  }

  const b = BANNERS[banner]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartOpen={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${b.bg} text-white relative overflow-hidden`}>
        <div className="max-w-screen-xl mx-auto px-4 py-10 md:py-16 flex items-center justify-between">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-4">
              <Zap size={14} /> 10-Minute Delivery
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{b.title} <br />Delivered Fast!</h1>
            <p className="text-white/90 mb-6 text-base">{b.sub}</p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setCategory(b.cat)} className="bg-white text-green-700 font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm">
                Shop Now →
              </button>
              <Link href="/register" className="bg-white/20 border border-white/40 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm">
                Get ₹50 OFF First Order
              </Link>
            </div>
          </div>
          <div className="hidden md:block text-8xl select-none">{b.emoji}</div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBanner(i)} className={`h-2 rounded-full transition-all ${i === banner ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
        <button onClick={() => setBanner((banner - 1 + BANNERS.length) % BANNERS.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"><ChevronLeft size={18} /></button>
        <button onClick={() => setBanner((banner + 1) % BANNERS.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"><ChevronRight size={18} /></button>
      </div>

      {/* Trust badges */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto scrollbar-hide text-xs font-semibold text-gray-500">
          {[['⚡', '10-Min Delivery'], ['🌱', 'Farm Fresh'], ['💰', 'Best Prices'], ['↩️', 'Easy Returns'], ['🔒', 'Secure Payment'], ['🤝', '100% Guarantee']].map(([icon, text]) => (
            <span key={text} className="flex items-center gap-1.5 whitespace-nowrap">{icon} {text}</span>
          ))}
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">Shop by <span className="text-green-600">Category</span></h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.slug} onClick={() => setCategory(cat.slug === category ? 'all' : cat.slug)}
                className={`border-2 rounded-xl p-2 text-center transition-all hover:scale-105 ${cat.color} ${category === cat.slug ? 'border-green-500 bg-green-50 scale-105' : ''}`}>
                <div className="text-2xl mb-0.5">{cat.emoji}</div>
                <div className="text-[10px] font-semibold text-gray-600 leading-tight">{cat.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Promo strip */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {[['FRESH10', '10% OFF on all orders', 'bg-green-600'], ['NEWUSER50', '₹50 OFF first order', 'bg-purple-600'], ['SAVE100', '₹100 OFF above ₹500', 'bg-orange-500'], ['WEEKEND15', '15% OFF weekends', 'bg-blue-600']].map(([code, desc, bg]) => (
            <div key={code} className={`${bg} text-white rounded-xl px-4 py-3 min-w-[160px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity`} onClick={() => { navigator.clipboard?.writeText(code); }}>
              <div className="font-black text-sm tracking-wider">{code}</div>
              <div className="text-xs opacity-90 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-800">
                {category === 'all' ? 'All Products' : CATEGORIES.find((c) => c.slug === category)?.name || category}
              </h2>
              {!loading && <p className="text-sm text-gray-400">{products.length} products</p>}
            </div>
            <div className="flex gap-2 items-center">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500 bg-white">
                <option value="default">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              {category !== 'all' && <button onClick={() => setCategory('all')} className="text-sm text-red-500 hover:underline font-medium">Clear ×</button>}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16"><div className="text-6xl mb-4">🔍</div><h3 className="font-bold text-gray-700">No products found</h3><p className="text-gray-400 mt-1">Try a different category or search term</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
            </div>
          )}
        </section>

        {/* Why FreshKart */}
        <section className="mt-14 bg-white rounded-3xl p-8 border border-gray-100">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-8">Why <span className="text-green-600">FreshKart</span>?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[['⚡', '10-Min Delivery', 'Fastest grocery delivery in India from our dark stores'], ['🌱', 'Farm Fresh', 'Direct from farms. 100% fresh or full refund guaranteed'], ['💰', 'Best Prices', 'Market-competitive prices with daily deals and cashback'], ['🤖', 'AI-Powered', 'Smart recommendations, voice search & AI assistant'], ['🔒', 'Secure Payments', 'Multiple payment options — 100% safe & encrypted'], ['♻️', 'Eco-Friendly', 'Biodegradable packaging. We plant a tree per 100 orders']].map(([icon, title, desc]) => (
              <div key={title} className="text-center p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-black text-green-400 mb-2">🛒 FreshKart</div>
            <p className="text-gray-400 text-sm leading-relaxed">India's fastest grocery delivery. Fresh produce, best prices, 10-minute delivery.</p>
          </div>
          {[['Quick Links', [['/', 'Home'], ['/orders', 'My Orders'], ['/login', 'Login'], ['/register', 'Register']]],
            ['Panels', [['/admin', 'Admin Panel'], ['/delivery', 'Delivery Panel']]],
            ['Support', [['#', 'Track Order'], ['#', 'Returns'], ['#', 'Contact Us']]]].map(([title, links]) => (
            <div key={title as string}>
              <h4 className="font-bold text-sm text-gray-200 mb-3">{title as string}</h4>
              <ul className="space-y-2">{(links as [string, string][]).map(([href, label]) => (
                <li key={label}><Link href={href} className="text-gray-400 text-sm hover:text-green-400 transition-colors">{label}</Link></li>
              ))}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 px-4 py-4 text-center text-xs text-gray-500">
          © 2024 FreshKart. Made with ❤️ by <strong className="text-green-400">Aditya Kumar Mehta</strong>
        </div>
      </footer>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="font-black text-lg">{quickViewProduct.name}</h2>
              <button onClick={() => setQuickViewProduct(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><X size={15} /></button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-40 flex items-center justify-center text-8xl mb-4">{quickViewProduct.emoji}</div>
            <div className="text-xs text-gray-400 font-semibold uppercase mb-1">{quickViewProduct.brand}</div>
            <div className="text-sm text-gray-600 leading-relaxed mb-4">{quickViewProduct.description}</div>
            <div className="flex items-center justify-between">
              <div><span className="text-2xl font-black">₹{quickViewProduct.price}</span>{quickViewProduct.mrp > quickViewProduct.price && <span className="text-sm text-gray-400 line-through ml-2">₹{quickViewProduct.mrp}</span>}</div>
              <div className="text-sm text-gray-400">{quickViewProduct.unit}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        {chatOpen && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-80 h-[440px] flex flex-col overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="text-2xl">🤖</span><div><div className="font-bold text-sm">FreshKart AI</div><div className="text-xs opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Online</div></div></div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.from === 'bot' && <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm shrink-0">🤖</div>}
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${msg.from === 'bot' ? 'bg-white text-gray-700 shadow-sm' : 'bg-purple-600 text-white'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
              {!chatMessages.length && <div className="flex gap-1 mb-2 flex-wrap">{['Offers', 'Delivery', 'Help'].map((q) => <button key={q} onClick={() => { setChatInput(q); }} className="text-xs bg-gray-100 rounded-full px-2 py-1">{q}</button>)}</div>}
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Ask me anything..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-400" />
              <button onClick={sendChat} className="bg-purple-600 text-white rounded-xl w-8 h-8 flex items-center justify-center hover:bg-purple-700"><Send size={13} /></button>
            </div>
          </div>
        )}
        <button onClick={() => setChatOpen(!chatOpen)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative">
          <Bot size={22} />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black px-1 rounded-full">AI</span>
        </button>
      </div>
    </div>
  )
}
