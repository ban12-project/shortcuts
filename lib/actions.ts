'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Album, Collection, Shortcut } from '@prisma/client'
import { z } from 'zod'

import { ShortcutRecord } from '#/app/api/icloud/[uuid]/shortcut'

const icloudSchema = z.object({
  icloud: z
    .string()
    .url()
    .startsWith(
      'https://www.icloud.com/shortcuts/',
      'must be start with https://www.icloud.com/shortcuts/',
    )
    .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
})

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    icloud?: string[]
    name?: string[]
    description?: string[]
    icon?: string[]
    backgroundColor?: string[]
    details?: string[]
    language?: string[]
  }
  message?: string | null
}

export async function getShortcutByiCloud(
  prevState: State,
  formData: FormData,
) {
  const validatedFields = icloudSchema.safeParse({
    icloud: formData.get('icloud'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const uuid = new URL(validatedFields.data.icloud).pathname.split('/').pop()

  if (!uuid) {
    return {
      message: 'Failed to get uuid.',
    }
  }

  const db = getRequestContext().env.DB
  const exists = await db
    .prepare(
      `SELECT EXISTS(SELECT 1 FROM Shortcut WHERE uuid = ?) AS is_exists`,
    )
    .bind(uuid)
    .first<0 | 1>('is_exists')

  if (exists) {
    return {
      message: 'Shortcut already exists.',
    }
  }

  const res = await fetch(
    `https://www.icloud.com/shortcuts/api/records/${uuid}`,
  )

  if (!res.ok) {
    return {
      message: 'Failed to fetch data.',
    }
  }

  const data: ShortcutRecord = await res.json()

  return {
    data,
  }
}

const shortcutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z
    .string()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  backgroundColor: z.string(),
  details: z
    .array(
      z.enum([
        'SHARE_SHEET',
        'APPLE_WATCH',
        'MENU_BAR_ON_MAC',
        'QUICK_ACTIONS_ON_MAC',
        'RECEIVES_SCREEN',
      ]),
    )
    .transform((val) => val.join(','))
    .nullable(),
  language: z.enum(['zh-CN', 'en']),
})
const formSchema = z.intersection(icloudSchema, shortcutSchema)

export async function postShortcut(prevState: State, formData: FormData) {
  if (formData.get('name') === null)
    return getShortcutByiCloud(prevState, formData)

  const validatedFields = formSchema.safeParse({
    icloud: formData.get('icloud'),
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    backgroundColor: formData.get('backgroundColor'),
    details: formData.getAll('details'),
    language: formData.get('language'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data',
    }
  }

  const {
    icloud,
    name,
    description,
    icon,
    backgroundColor,
    details,
    language,
  } = validatedFields.data
  const uuid = new URL(icloud).pathname.split('/').pop()

  if (!uuid) {
    return {
      message: 'Failed to get uuid',
    }
  }

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `
      INSERT INTO Shortcut (updatedAt, uuid, icloud, name, description, icon, backgroundColor, details, language, collectionId, albumId) 
      VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
    `,
    )
    .bind(
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
    )
    .run()

  if (!result.success) {
    return {
      message: 'Failed to insert data.',
    }
  }

  revalidatePath('/')
  redirect('/')
}

export async function fetchAlbums() {
  const db = getRequestContext().env.DB
  const { results: albums } = await db
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
    `,
    )
    .all<Album & { shortcuts: string }>()

  return albums
}

export async function fetchCollections() {
  const db = getRequestContext().env.DB
  const { results: collections } = await db
    .prepare(
      `
    SELECT
      id,
      title,
      image
    FROM Collection
  `,
    )
    .all<Collection>()

  return collections
}

export async function fetchShortcutByID(id: string) {
  const db = getRequestContext().env.DB
  const shortcut = await db
    .prepare(`SELECT * FROM Shortcut WHERE id = ?`)
    .bind(id)
    .first<Shortcut>()

  return shortcut
}
