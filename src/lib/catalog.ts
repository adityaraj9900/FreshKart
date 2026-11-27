export const FREE_DELIVERY_THRESHOLD = 199
export const DELIVERY_FEE = 25

export const CATEGORIES = [
  { slug: 'vegetables', name: 'Vegetables', emoji: '🥦', tint: 'bg-emerald-50' },
  { slug: 'fruits', name: 'Fruits', emoji: '🍎', tint: 'bg-rose-50' },
  { slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛', tint: 'bg-sky-50' },
  { slug: 'staples', name: 'Staples', emoji: '🌾', tint: 'bg-amber-50' },
  { slug: 'snacks', name: 'Snacks', emoji: '🍿', tint: 'bg-violet-50' },
  { slug: 'beverages', name: 'Beverages', emoji: '☕', tint: 'bg-teal-50' },
  { slug: 'masalas', name: 'Masalas', emoji: '🌶️', tint: 'bg-orange-50' },
  { slug: 'personal', name: 'Personal Care', emoji: '🧴', tint: 'bg-cyan-50' },
  { slug: 'household', name: 'Household', emoji: '🧹', tint: 'bg-slate-100' },
  { slug: 'organic', name: 'Organic', emoji: '🌱', tint: 'bg-lime-50' },
] as const

export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 })
export const formatINR = (n: number) => inr.format(Math.round(n * 100) / 100)

export const shortId = (id: string) => id.slice(-8).toUpperCase()
