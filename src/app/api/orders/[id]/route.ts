import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: { select: { name: true, email: true, phone: true } }, deliveryBoy: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: any = { status: body.status }
  if (body.status === 'delivered') data.deliveredAt = new Date()
  if (body.deliveryBoyId) data.deliveryBoyId = body.deliveryBoyId
  const order = await prisma.order.update({ where: { id: params.id }, data, include: { items: true } })
  return NextResponse.json(order)
}
