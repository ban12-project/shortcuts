import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Shortcut } from '@prisma/client'
import { getDictionary } from '#/get-dictionary'

import ShortcutAdd, { ShortcutAddProps } from '#/components/ui/shortcut-add'

export default async function ShortcutPage({
  params,
}: Omit<ShortcutAddProps, 'messages'>) {
  const messages = await getDictionary(params.lang)

  return (
    <main className="flex max-h-screen flex-col">
      <ShortcutAdd messages={messages} params={params} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: Omit<ShortcutAddProps, 'messages'>): Promise<Metadata> {
  const db = getRequestContext().env.DB
  const shortcut = await db
    .prepare(`SELECT * FROM Shortcut WHERE id = ?`)
    .bind(params.id)
    .first<Shortcut>()

  if (!shortcut) notFound()

  return {
    title: shortcut.name,
    description: shortcut.description,
  }
}

export const runtime = 'edge'
