import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const boys = await prisma.deliveryBoy.findMany({
    select: { id: true, name: true, email: true, phone: true, area: true, status: true, rating: true, totalDeliveries: true, todayDeliveries: true, earnings: true, vehicleType: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(boys)
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  const boy = await prisma.deliveryBoy.update({ where: { id }, data: { status } })
  return NextResponse.json(boy)
}
