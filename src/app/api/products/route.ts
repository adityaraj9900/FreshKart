import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'default'
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: any = {}
  if (category && category !== 'all') where.category = { slug: category }
  if (search) where.OR = [
    { name: { contains: search } },
    { brand: { contains: search } },
    { description: { contains: search } },
  ]

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_low') orderBy = { price: 'asc' }
  else if (sort === 'price_high') orderBy = { price: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }
  else if (sort === 'popular') orderBy = { reviews: 'desc' }

  const products = await prisma.product.findMany({ where, orderBy, take: limit, include: { category: true } })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = await prisma.product.create({ data: { ...body, tags: JSON.stringify(body.tags || []) }, include: { category: true } })
  return NextResponse.json(product, { status: 201 })
}
