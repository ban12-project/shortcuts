'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Album, Collection, Shortcut } from '@prisma/client'
import { signIn } from '#/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'

import type { ShortcutRecord } from './shortcut'

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

  let albumId: number = NaN
  try {
    if (!process.env.GOOGLE_GEMINI_KEY || !process.env.GOOGLE_GEMINI_MODEL)
      throw new Error('Google Gemini API key or model not set')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_GEMINI_MODEL,
    })
    const { results: albums } = await db
      .prepare(`SELECT * FROM Album`)
      .all<Album>()
    const prompt = `Which of the following options describes "${name}, ${description}" Answer with numbers:
        Options:
        ${albums
          .map((item) => `${item.id}: ${item.title} ${item.description}`)
          .join('\n')}
        The answer is:
      `
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    albumId = Number.parseInt(text)
  } catch (e) {}

  const result = await db
    .prepare(
      `
      INSERT INTO Shortcut (updatedAt, uuid, icloud, name, description, icon, backgroundColor, details, language, collectionId, albumId) 
      VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
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
      albumId || null,
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
            'icon', s.icon,
            'backgroundColor', s.backgroundColor
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

const searchSchema = z.object({
  query: z.string().min(1).max(64),
})

export async function searchShortcuts(query: string) {
  const validatedFields = searchSchema.safeParse({
    query,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const db = getRequestContext().env.DB
  const { results: shortcuts } = await db
    .prepare(
      `
    SELECT 
      id,
      name,
      description,
      icon,
      backgroundColor
    FROM Shortcut
    WHERE name LIKE ? OR description LIKE ?
    `,
    )
    .bind(`%${query}%`, `%${query}%`)
    .all<Shortcut>()

  return shortcuts
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

const updateSchema = z.intersection(
  formSchema,
  z.object({
    id: z.string(),
    uuid: z.string(),
    albumId: z.string().nullable(),
    collectionId: z.string().nullable(),
  }),
)

export async function updateShortcut(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = updateSchema.safeParse({
    id: formData.get('id'),
    uuid: formData.get('uuid'),
    albumId: formData.get('albumId'),
    collectionId: formData.get('collectionId'),
    icloud: formData.get('icloud'),
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    backgroundColor: formData.get('backgroundColor'),
    details: [],
    language: formData.get('language'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const {
    id,
    uuid,
    albumId,
    collectionId,
    icloud,
    name,
    description,
    icon,
    backgroundColor,
    details,
    language,
  } = validatedFields.data

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `
      UPDATE Shortcut
      SET
        updatedAt = CURRENT_TIMESTAMP,
        uuid = ?,
        icloud = ?,
        name = ?,
        description = ?,
        icon = ?,
        backgroundColor = ?,
        details = ?,
        language = ?,
        collectionId = ?,
        albumId = ?
      WHERE id = ?
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
      collectionId || null,
      albumId || null,
      id,
    )
    .run()

  if (!result.success) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

const collectionSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
})
export async function createCollection(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = collectionSchema.safeParse({
    title: formData.get('title'),
    image: formData.get('image'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { title, image } = validatedFields.data

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `INSERT INTO Collection (title, image, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)`,
    )
    .bind(title, image)
    .run()

  if (!result.success) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateCollection(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      collectionSchema,
      z.object({
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      image: formData.get('image'),
    })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { id, title, image } = validatedFields.data

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `UPDATE Collection SET title = ?, image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    )
    .bind(title, image, id)
    .run()

  if (!result.success) {
    return 'Failed to update data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

const albumSheetSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  collectionId: z
    .string()
    .optional()
    .transform((val) => val || null),
})

export async function createAlbum(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = albumSheetSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    collectionId: formData.get('collectionId'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { title, description, collectionId } = validatedFields.data

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `INSERT INTO Album (title, description, collectionId, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    )
    .bind(title, description, collectionId)
    .run()

  if (!result.success) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateAlbum(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      albumSheetSchema,
      z.object({
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      description: formData.get('description'),
      collectionId: formData.get('collectionId'),
    })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { id, title, description, collectionId } = validatedFields.data

  const db = getRequestContext().env.DB
  const result = await db
    .prepare(
      `UPDATE Album SET title = ?, description = ?, collectionId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    )
    .bind(title, description, collectionId, id)
    .run()

  if (!result.success) {
    return 'Failed to update data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function getShortcuts() {
  const db = getRequestContext().env.DB
  const { results: shortcuts } = await db
    .prepare(`SELECT * FROM Shortcut`)
    .all<Shortcut>()

  return shortcuts
}

export async function getCollections() {
  const db = getRequestContext().env.DB
  const { results: collections } = await db
    .prepare(`SELECT * FROM Collection`)
    .all<Collection>()

  return collections
}

export async function getAlbums() {
  const db = getRequestContext().env.DB
  const { results: albums } = await db
    .prepare(`SELECT * FROM Album`)
    .all<Album>()

  return albums
}
