import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/guards'

export async function GET() {
  const auth = await requireRole('admin', 'delivery')
  if (auth instanceof NextResponse) return auth
  const boys = await prisma.deliveryBoy.findMany({
    where: auth.role === 'delivery' ? { id: auth.id } : undefined,
    select: { id: true, name: true, email: true, phone: true, area: true, status: true, rating: true, totalDeliveries: true, todayDeliveries: true, earnings: true, vehicleType: true, vehicleNumber: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(boys)
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole('admin', 'delivery')
  if (auth instanceof NextResponse) return auth
  const { id, status } = await req.json().catch(() => ({}))
  if (!['active', 'offline'].includes(status)) return NextResponse.json({ error: 'Status must be active or offline' }, { status: 400 })
  // Partners can only change their own availability.
  const targetId = auth.role === 'delivery' ? auth.id : id
  if (typeof targetId !== 'string') return NextResponse.json({ error: 'Missing partner id' }, { status: 400 })

  const boy = await prisma.deliveryBoy.update({ where: { id: targetId }, data: { status }, select: { id: true, status: true } }).catch(() => null)
  if (!boy) return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  return NextResponse.json(boy)
}
