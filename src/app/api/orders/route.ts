import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { evaluatePromo, deliveryChargeFor } from '@/lib/pricing'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const userId = (session.user as any).id
  const role = (session.user as any).role

  const where: any = role === 'admin' ? {} : role === 'delivery' ? { deliveryBoyId: userId } : { userId }
  if (status && status !== 'all') where.status = status

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, user: { select: { name: true, email: true, phone: true } }, deliveryBoy: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const userId = (session.user as any).id

  // Validate the request shape. Prices and totals are never taken from the client.
  const requested: { id: string; qty: number }[] = Array.isArray(body?.items)
    ? body.items.filter((i: any) => typeof i?.id === 'string' && Number.isInteger(i?.qty) && i.qty > 0)
    : []
  if (!requested.length) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
  const address = typeof body?.address === 'string' ? body.address.trim() : ''
  if (!address) return NextResponse.json({ error: 'Add a delivery address to continue' }, { status: 400 })

  const products = await prisma.product.findMany({ where: { id: { in: requested.map((i) => i.id) } } })
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: { product: (typeof products)[number]; qty: number }[] = []
  for (const item of requested) {
    const product = byId.get(item.id)
    if (!product) return NextResponse.json({ error: 'An item in your cart is no longer available' }, { status: 409 })
    if (product.stock < item.qty) return NextResponse.json({ error: `Only ${product.stock} left for ${product.name}` }, { status: 409 })
    lines.push({ product, qty: item.qty })
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.product.price * l.qty, 0) * 100) / 100
  let discount = 0
  let promoCode: string | null = null
  if (typeof body?.promoCode === 'string' && body.promoCode.trim()) {
    const code = body.promoCode.trim().toUpperCase()
    const result = evaluatePromo(await prisma.promoCode.findUnique({ where: { code } }), subtotal)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    discount = result.discount
    promoCode = code
  }
  const deliveryCharge = deliveryChargeFor(subtotal)
  const total = Math.round((subtotal - discount + deliveryCharge) * 100) / 100

  // Find an active delivery partner
  const deliveryBoy = await prisma.deliveryBoy.findFirst({ where: { status: 'active' } })

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        subtotal,
        discount,
        deliveryCharge,
        total,
        paymentMethod: typeof body?.paymentMethod === 'string' ? body.paymentMethod : 'UPI',
        promoCode,
        address,
        deliveryBoyId: deliveryBoy?.id,
        status: 'confirmed',
        items: {
          create: lines.map(({ product, qty }) => ({
            productId: product.id,
            qty,
            price: product.price,
            name: product.name,
            emoji: product.emoji,
          })),
        },
      },
      include: { items: true, deliveryBoy: { select: { name: true, phone: true } } },
    })
    for (const { product, qty } of lines) {
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: qty } } })
    }
    if (promoCode) await tx.promoCode.update({ where: { code: promoCode }, data: { usedCount: { increment: 1 } } })
    return created
  })

  return NextResponse.json(order, { status: 201 })
}
