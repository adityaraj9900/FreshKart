import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } })

  if (!promo || !promo.active) return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
  if (subtotal < promo.minOrder) return NextResponse.json({ error: `Minimum order ₹${promo.minOrder} required` }, { status: 400 })

  const discount = promo.type === 'percent'
    ? Math.min(subtotal * promo.discount / 100, promo.maxDiscount)
    : promo.discount

  return NextResponse.json({ valid: true, discount, description: promo.description })
}
