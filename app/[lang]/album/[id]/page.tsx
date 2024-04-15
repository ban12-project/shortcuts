import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Album, Shortcut } from '@prisma/client'
import { Locale } from '#/i18n-config'

import ShortcutCard from '#/components/ui/shortcut-card'

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
            'icon', s.icon
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
      <ul className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
        {(JSON.parse(album.shortcuts) as Shortcut[]).map((item) => (
          <li key={item.id} className="flex h-32">
            <ShortcutCard className="w-[calc((100%-0.75rem)/2)]" item={item} />
            <p className="ml-3 h-full overflow-hidden text-ellipsis leading-[25.6px] text-zinc-500/90">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
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
