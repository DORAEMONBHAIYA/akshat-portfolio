import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // If DIRECT_DATABASE_URL is set (Turso), use libsql adapter
  // Otherwise fall back to standard PrismaClient (local SQLite)
  const directUrl = process.env.DIRECT_DATABASE_URL

  if (directUrl) {
    const authToken = process.env.DATABASE_AUTH_TOKEN
    const libsql = createClient({
      url: directUrl,
      authToken: authToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Local development with SQLite
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

globalForPrisma.prisma = db

if (process.env.NODE_ENV !== 'production') {
  // Suppress Prisma query logs in development for cleaner console
  // Uncomment below to debug database queries:
  // (db as any).$on('query', (e: any) => console.log(e))
}
