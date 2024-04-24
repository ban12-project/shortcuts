import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Collection } from '@prisma/client'

import Form from '../form'

export const runtime = 'edge'

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string }
}) {
  const db = getRequestContext().env.DB
  const collection = await db
    .prepare(`SELECT * FROM Collection WHERE id=?`)
    .bind(params.id)
    .first<Collection>()

  if (!collection) notFound()

  return (
    <main className="container-full">
      <Form fields={collection} />
    </main>
  )
}
