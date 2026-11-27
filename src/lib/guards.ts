import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export type Role = 'customer' | 'admin' | 'delivery'
export type SessionUser = { id: string; role: Role; name?: string | null; email?: string | null }

export async function getSessionUser(): Promise<SessionUser | null> {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    // e.g. NEXTAUTH_SECRET missing in production: treat as signed out so public routes still work
    console.error('[auth] could not read session:', err)
    return null
  }
  const user = session?.user as Partial<SessionUser> | undefined
  if (!user?.id || !user.role) return null
  return user as SessionUser
}

/**
 * Returns the signed-in user when their role is allowed, otherwise a ready-to-return
 * 401/403 response. Usage: `const auth = await requireRole('admin'); if (auth instanceof NextResponse) return auth`
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
  if (roles.length && !roles.includes(user.role)) return NextResponse.json({ error: 'You do not have access to this action' }, { status: 403 })
  return user
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
