import Link from 'next/link'
import { ShoppingBag, Zap, ShieldCheck, Leaf } from 'lucide-react'

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-800 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700"><ShoppingBag size={20} strokeWidth={2.4} /></span>
          <span className="text-xl font-extrabold tracking-tight">FreshKart</span>
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Your weekly groceries, sorted in minutes.</h2>
          <ul className="mt-8 space-y-4 text-[15px] text-brand-100">
            <li className="flex items-center gap-3"><Zap size={18} className="text-brand-300" /> Delivery in about 10 minutes</li>
            <li className="flex items-center gap-3"><Leaf size={18} className="text-brand-300" /> Fresh produce, checked before packing</li>
            <li className="flex items-center gap-3"><ShieldCheck size={18} className="text-brand-300" /> Secure payments and easy returns</li>
          </ul>
        </div>
        <div className="relative mt-12 select-none text-6xl tracking-[0.3em] opacity-90" aria-hidden>🥦🍎🥛🥖</div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><ShoppingBag size={19} strokeWidth={2.4} /></span>
            <span className="text-lg font-extrabold tracking-tight">Fresh<span className="text-brand-600">Kart</span></span>
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-gray-500">{footer}</div>
        </div>
      </main>
    </div>
  )
}

export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">{label}</label>
      {children}
      {error ? <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  )
}

export const inputClass =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 aria-[invalid=true]:border-red-400'
