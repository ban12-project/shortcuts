import { getRequestContext } from '@cloudflare/next-on-pages'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

export const getPrismaWithD1 = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  // Initialize Prisma Client with the D1 adapter
  const adapter = new PrismaD1(getRequestContext().env.DB)
  // @ts-ignore
  const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

  return prisma
}
