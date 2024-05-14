import { getRequestContext } from '@cloudflare/next-on-pages'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

// const prismaClientSingleton = () => {
//   return new PrismaClient()
// }

declare const globalThis: {
  prismaGlobal: PrismaClient
} & typeof global

// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// export default prisma

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export const getPrismaWithD1 = () => {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal

  // Initialize Prisma Client with the D1 adapter
  const adapter = new PrismaD1(getRequestContext().env.DB)
  const prisma = globalThis.prismaGlobal || new PrismaClient({ adapter })
  if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

  return prisma
}
