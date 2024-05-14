import { notFound } from 'next/navigation'

import { getPrismaWithD1 } from '#/lib/prisma'

import Form from '../form'

export const runtime = 'edge'

export default async function EditAlbumPage({
  params,
}: {
  params: { id: string }
}) {
  const prisma = getPrismaWithD1()
  const album = await prisma.album.findUnique({
    where: { id: Number.parseInt(params.id) },
  })

  if (!album) notFound()

  return (
    <main className="container-full">
      <Form fields={album} />
    </main>
  )
}
