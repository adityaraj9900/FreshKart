import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, ORDER_STATUSES, type OrderStatus } from '@/lib/guards'

type Ctx = { params: Promise<{ id: string }> }

// Next step a delivery partner may move their assigned order to.
const PARTNER_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: 'processing',
  processing: 'out_for_delivery',
  out_for_delivery: 'delivered',
}
const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed']

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireRole()
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true, phone: true } }, deliveryBoy: { select: { name: true, phone: true, vehicleType: true } } },
  })
  const allowed = order && (auth.role === 'admin' || order.userId === auth.id || order.deliveryBoyId === auth.id)
  if (!allowed) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireRole()
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const status = body?.status as OrderStatus
  if (!ORDER_STATUSES.includes(status)) return NextResponse.json({ error: 'Unknown order status' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  const current = order.status as OrderStatus

  const permitted =
    auth.role === 'admin' ||
    (auth.role === 'delivery' && order.deliveryBoyId === auth.id && PARTNER_NEXT[current] === status) ||
    (auth.role === 'customer' && order.userId === auth.id && status === 'cancelled' && CANCELLABLE.includes(current))
  if (!permitted) return NextResponse.json({ error: 'This status change is not allowed' }, { status: 403 })

  const updated = await prisma.$transaction(async (tx) => {
    // Put stock back when an order is cancelled, and take it again if it is re-opened.
    if (status === 'cancelled' && current !== 'cancelled') {
      for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } })
    } else if (current === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } })
    }
    return tx.order.update({
      where: { id },
      data: {
        status,
        deliveredAt: status === 'delivered' ? new Date() : current === 'delivered' ? null : undefined,
        ...(auth.role === 'admin' && typeof body.deliveryBoyId === 'string' ? { deliveryBoyId: body.deliveryBoyId } : {}),
      },
      include: { items: true },
    })
  })
  return NextResponse.json(updated)
}
