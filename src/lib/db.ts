import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

/**
 * Resolves the SQLite database location.
 *
 * - Local dev: DATABASE_URL from .env (file:./dev.db, relative to prisma/schema.prisma).
 * - Vercel: the deployment filesystem is read-only, so the seeded prisma/dev.db that ships
 *   with the function is copied to /tmp once per instance and opened from there. Reads always
 *   work; writes (orders, sign-ups) work but are not shared between instances or kept across
 *   cold starts. Point DATABASE_URL at a hosted database for durable data.
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

  if (configured && !configured.startsWith('file:')) return configured // hosted database
  if (!isServerless) return configured || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`

  const bundled = path.join(process.cwd(), 'prisma', 'dev.db')
  const writable = path.join('/tmp', 'freshkart.db')
  if (!fs.existsSync(writable)) {
    if (!fs.existsSync(bundled)) throw new Error(`Seed database not found at ${bundled}`)
    fs.copyFileSync(bundled, writable)
  }
  return `file:${writable}`
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const url = resolveDatabaseUrl()
  process.env.DATABASE_URL = url // schema reads env("DATABASE_URL")
  return new PrismaClient({ datasources: { db: { url } } })
}

export const prisma = globalForPrisma.prisma ?? createClient()

globalForPrisma.prisma = prisma
