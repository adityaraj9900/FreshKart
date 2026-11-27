import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/guards'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null

  if (name.length < 2) return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'An account with this email already exists. Try logging in.' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed, phone } })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
}

export async function GET() {
  const auth = await requireRole('admin')
  if (auth instanceof NextResponse) return auth
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}
