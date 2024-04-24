import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Album, Shortcut } from '@prisma/client'
import { Locale } from '#/i18n-config'

import ShortcutList from '#/components/ui/shortcut-list'

type ListPageProps = {
  params: { id: string; lang: Locale }
}

export default async function ListPage({ params }: ListPageProps) {
  const db = getRequestContext().env.DB
  const album = await db
    .prepare(
      `
    SELECT 
      id,
      title,
      description,
      (
        SELECT 
          json_group_array(json_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'backgroundColor', s.backgroundColor
          ))
        FROM Shortcut s
        WHERE s.albumId = Album.id
      ) AS shortcuts
    FROM Album
    WHERE id = ?
  `,
    )
    .bind(params.id)
    .first<Album & { shortcuts: string }>()

  if (!album) notFound()

  return (
    <main className="container-full pt-safe-max-4">
      <h2 className="text-3xl font-bold">{album.title}</h2>
      <ShortcutList shortcuts={JSON.parse(album.shortcuts) as Shortcut[]} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const db = getRequestContext().env.DB
  const album = await db
    .prepare(
      `
    SELECT 
      id,
      title,
      description
    FROM Album
    WHERE id = ?
  `,
    )
    .bind(params.id)
    .first<Album>()

  if (!album) notFound()

  return {
    title: album.title,
    description: album.description,
  }
}

export const runtime = 'edge'
