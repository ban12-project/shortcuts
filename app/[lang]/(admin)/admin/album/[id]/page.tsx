import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Album } from '@prisma/client'

import Form from '../form'

export const runtime = 'edge'

export default async function EditAlbumPage({
  params,
}: {
  params: { id: string }
}) {
  const db = getRequestContext().env.DB
  const album = await db
    .prepare(`SELECT * FROM Album WHERE id=?`)
    .bind(params.id)
    .first<Album>()

  if (!album) notFound()

  return (
    <main className="container-full">
      <Form fields={album} />
    </main>
  )
}
