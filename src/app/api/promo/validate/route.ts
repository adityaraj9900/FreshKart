import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { evaluatePromo } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json().catch(() => ({}))
  if (typeof code !== 'string' || !code.trim() || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Enter a coupon code' }, { status: 400 })
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } })
  const result = evaluatePromo(promo, subtotal)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ valid: true, discount: result.discount, description: promo!.description })
}
