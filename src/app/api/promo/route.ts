import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/guards'

export async function GET() {
  const user = await getSessionUser()
  const promos = await prisma.promoCode.findMany({
    // Shoppers only see live coupons; admins see everything, including usage.
    where: user?.role === 'admin' ? undefined : { active: true },
    select: user?.role === 'admin' ? undefined : { id: true, code: true, description: true, minOrder: true, active: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  const auth = await requireRole('admin')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const promo = await prisma.promoCode.create({ data: body })
  return NextResponse.json(promo, { status: 201 })
}
