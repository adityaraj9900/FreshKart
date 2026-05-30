'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) { toast.error(data.error); return }
        await signIn('credentials', { email: form.email, password: form.password, redirect: false })
        toast.success('Welcome to FreshKart! ₹50 OFF added 🎉')
        router.push('/')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6"><ShoppingCart className="text-green-600" size={28} /><span className="text-2xl font-black text-green-600">FreshKart</span></Link>
        <div className="text-center mb-6"><div className="text-4xl mb-2">🎉</div><h1 className="text-2xl font-black text-gray-800">Create Account</h1><p className="text-sm text-green-600 font-semibold mt-1">Get ₹50 OFF on your first order!</p></div>
        <form onSubmit={handle} className="space-y-4">
          {[['Full Name', 'name', 'text', 'Aditya Kumar'], ['Email Address', 'email', 'email', 'your@email.com'], ['Phone Number', 'phone', 'tel', '+91 98765 43210'], ['Password', 'password', 'password', 'Create a strong password']].map(([label, key, type, placeholder]) => (
            <div key={key as string}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label as string}</label>
              <input type={type as string} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key as string]: e.target.value })} placeholder={placeholder as string} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-70 transition-all">
            {loading ? 'Creating Account...' : 'Create Account & Get ₹50 OFF'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-5">Already have an account? <Link href="/login" className="text-green-600 font-bold hover:underline">Login</Link></p>
      </div>
    </div>
  )
}
