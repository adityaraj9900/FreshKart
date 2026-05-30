import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

  const body = await req.json()
  const userId = (session.user as any).id

  // Find an active delivery boy
  const deliveryBoy = await prisma.deliveryBoy.findFirst({ where: { status: 'active' } })

  const order = await prisma.order.create({
    data: {
      userId,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      deliveryCharge: body.deliveryCharge || 25,
      total: body.total,
      paymentMethod: body.paymentMethod || 'UPI',
      promoCode: body.promoCode,
      address: body.address,
      deliveryBoyId: deliveryBoy?.id,
      status: 'confirmed',
      items: {
        create: body.items.map((item: any) => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
          name: item.name,
          emoji: item.emoji,
        })),
      },
    },
    include: { items: true, deliveryBoy: { select: { name: true, phone: true } } },
  })

  // Update promo usage
  if (body.promoCode) {
    await prisma.promoCode.update({ where: { code: body.promoCode }, data: { usedCount: { increment: 1 } } }).catch(() => {})
  }

  return NextResponse.json(order, { status: 201 })
}
