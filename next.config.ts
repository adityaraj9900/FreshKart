import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
  typescript: { ignoreBuildErrors: true },
  // Ship the seeded SQLite database with every server function (see src/lib/db.ts).
  outputFileTracingIncludes: {
    '/**': ['./prisma/dev.db'],
  },
}

export default nextConfig
