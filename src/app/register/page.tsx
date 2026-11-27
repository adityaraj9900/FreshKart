'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthShell, { Field, inputClass } from '@/components/AuthShell'

type Form = { name: string; email: string; phone: string; password: string }
type Errors = Partial<Record<keyof Form | 'form', string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your full name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Please enter a valid email address'
  if (f.phone && !/^[+\d][\d\s-]{7,}$/.test(f.phone.trim())) e.phone = 'Please enter a valid phone number'
  if (f.password.length < 6) e.password = 'Use at least 6 characters'
  return e
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setLoading(true)
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrors({ form: data.error || 'Could not create your account' }); return }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      toast.success('Account created. Use NEWUSER50 for ₹50 off your first order.', { duration: 4500 })
      router.push('/')
      router.refresh()
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldProps = (k: keyof Form) => ({ id: k, value: form[k], onChange: set(k), 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-error` : undefined, className: inputClass })

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute. New customers get ₹50 off with code NEWUSER50."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
        <Field id="name" label="Full name" error={errors.name}>
          <input {...fieldProps('name')} autoComplete="name" placeholder="Your full name" />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input {...fieldProps('email')} type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field id="phone" label="Phone number (optional)" hint="Your delivery partner uses this to reach you." error={errors.phone}>
          <input {...fieldProps('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" />
        </Field>
        <Field id="password" label="Password" hint="At least 6 characters." error={errors.password}>
          <div className="relative">
            <input {...fieldProps('password')} className={`${inputClass} pr-12`} type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" />
            <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />} Create account
        </button>
        <p className="text-center text-xs text-gray-400">By continuing you agree to FreshKart’s terms and privacy policy.</p>
      </form>
    </AuthShell>
  )
}
