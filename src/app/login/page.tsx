'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, User, LayoutDashboard, Bike } from 'lucide-react'
import AuthShell, { Field, inputClass } from '@/components/AuthShell'

const DEMO = [
  { role: 'customer', label: 'Customer', icon: User, email: 'demo@freshkart.com', password: 'demo123', to: '/' },
  { role: 'admin', label: 'Admin', icon: LayoutDashboard, email: 'admin@freshkart.com', password: 'admin123', to: '/admin' },
  { role: 'delivery', label: 'Delivery', icon: Bike, email: 'ravi@freshkart.com', password: 'delivery123', to: '/delivery' },
] as const

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const login = async (creds: { email: string; password: string }, to: string, key: string) => {
    setLoading(key)
    setError('')
    const res = await signIn('credentials', { ...creds, redirect: false })
    setLoading(null)
    if (res?.ok) {
      toast.success('Logged in')
      router.push(to)
      router.refresh()
    } else {
      setError('That email and password don’t match. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to check out faster and track your orders."
      footer={<>New to FreshKart? <Link href="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); login({ email, password }, '/', 'form') }} className="space-y-4" noValidate>
        <Field id="email" label="Email">
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!error} className={inputClass} />
        </Field>
        <Field id="password" label="Password" error={error}>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              aria-invalid={!!error}
              aria-describedby={error ? 'password-error' : undefined}
              className={`${inputClass} pr-12`}
            />
            <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <button type="submit" disabled={!!loading || !email || !password} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400">
          {loading === 'form' && <Loader2 size={18} className="animate-spin" />} Log in
        </button>
      </form>

      <div className="my-7 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> Try a demo account <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEMO.map(({ role, label, icon: Icon, email: e, password: p, to }) => (
          <button
            key={role}
            onClick={() => login({ email: e, password: p }, to, role)}
            disabled={!!loading}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white py-3 text-[13px] font-medium text-gray-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
          >
            {loading === role ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
            {label}
          </button>
        ))}
      </div>
    </AuthShell>
  )
}
