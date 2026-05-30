'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ShoppingCart, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) { toast.success('Welcome back! 🎉'); router.push('/') }
    else toast.error('Invalid email or password')
  }

  const demoLogin = async (role: string) => {
    setLoading(true)
    const creds = role === 'admin' ? { email: 'admin@freshkart.com', password: 'admin123' } : role === 'delivery' ? { email: 'ravi@freshkart.com', password: 'delivery123' } : { email: 'demo@freshkart.com', password: 'demo123' }
    const res = await signIn('credentials', { ...creds, redirect: false })
    setLoading(false)
    if (res?.ok) {
      toast.success(`Logged in as ${role}!`)
      router.push(role === 'admin' ? '/admin' : role === 'delivery' ? '/delivery' : '/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6">
          <ShoppingCart className="text-green-600" size={28} />
          <span className="text-2xl font-black text-green-600">FreshKart</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-800 text-center mb-1">Welcome Back! 👋</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Login to continue shopping</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Eye size={16} /></button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-70 transition-all">
            {loading ? 'Logging in...' : 'Login to FreshKart'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3"><div className="flex-1 h-px bg-gray-100" /><span className="text-xs text-gray-400 font-medium">or try demo accounts</span><div className="flex-1 h-px bg-gray-100" /></div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[['Customer', 'customer'], ['Admin', 'admin'], ['Delivery', 'delivery']].map(([label, role]) => (
            <button key={role} onClick={() => demoLogin(role)} disabled={loading} className="border-2 border-gray-200 hover:border-green-400 rounded-xl py-2 text-xs font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50">
              {label === 'Customer' ? '👤' : label === 'Admin' ? '⚙️' : '🏍️'}<br />{label}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-green-600 font-bold hover:underline">Register & Get ₹50 OFF</Link>
        </p>
      </div>
    </div>
  )
}
