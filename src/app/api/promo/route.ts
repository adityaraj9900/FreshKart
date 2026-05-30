import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const promo = await prisma.promoCode.create({ data: body })
  return NextResponse.json(promo, { status: 201 })
}
