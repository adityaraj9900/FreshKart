import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/guards'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE = ['name', 'description', 'price', 'mrp', 'unit', 'emoji', 'badge', 'brand', 'stock', 'categoryId'] as const

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await requireRole('admin')
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const data: Record<string, unknown> = {}
  for (const key of EDITABLE) if (key in body) data[key] = body[key]
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags)

  const product = await prisma.product.update({ where: { id }, data, include: { category: true } }).catch(() => null)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireRole('admin')
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const ordered = await prisma.orderItem.count({ where: { productId: id } })
  if (ordered > 0) {
    return NextResponse.json({ error: 'This product appears in past orders. Set its stock to 0 to hide it from sale instead.' }, { status: 409 })
  }
  const deleted = await prisma.product.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
