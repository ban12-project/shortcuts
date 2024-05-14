import { notFound } from 'next/navigation'

import { getPrismaWithD1 } from '#/lib/prisma'

import Form from '../form'

export const runtime = 'edge'

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string }
}) {
  const prisma = getPrismaWithD1()
  const collection = await prisma.collection.findUnique({
    where: { id: Number.parseInt(params.id) },
  })

  if (!collection) notFound()

  return (
    <main className="container-full">
      <Form fields={collection} />
    </main>
  )
}
