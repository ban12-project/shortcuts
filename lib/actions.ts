'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { signIn } from '#/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'

import { getPrismaWithD1 } from './prisma'
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

  const prisma = getPrismaWithD1()
  const exists = await prisma.shortcut.findUnique({
    where: { uuid },
  })

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

  const prisma = getPrismaWithD1()

  let albumId: number = NaN
  try {
    if (!process.env.GOOGLE_GEMINI_KEY || !process.env.GOOGLE_GEMINI_MODEL)
      throw new Error('Google Gemini API key or model not set')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_GEMINI_MODEL,
    })
    const albums = await prisma.album.findMany()
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

  const result = await prisma.shortcut.create({
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
      collectionId: null,
      albumId: albumId || null,
    },
  })

  if (!result) {
    return {
      message: 'Failed to insert data.',
    }
  }

  revalidatePath('/')
  redirect('/')
}

export async function fetchAlbums() {
  const prisma = getPrismaWithD1()
  const albums = await prisma.album.findMany({
    include: {
      shortcuts: true,
    },
  })

  return albums
}

export async function fetchCollections() {
  const prisma = getPrismaWithD1()
  const collections = await prisma.collection.findMany()

  return collections
}

export async function fetchShortcutByID(id: string) {
  const prisma = getPrismaWithD1()
  const shortcut = await prisma.shortcut.findUnique({
    where: { id: Number.parseInt(id) },
  })

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

  const prisma = getPrismaWithD1()
  const shortcuts = await prisma.shortcut.findMany({
    where: {
      OR: [
        {
          name: {
            contains: validatedFields.data.query,
          },
        },
        {
          description: {
            contains: validatedFields.data.query,
          },
        },
      ],
    },
  })

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

  const prisma = getPrismaWithD1()
  const result = await prisma.shortcut.update({
    where: { id: Number.parseInt(id) },
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
      albumId: albumId ? Number.parseInt(albumId) : null,
    },
  })

  if (!result) {
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

  const prisma = getPrismaWithD1()
  const result = await prisma.collection.create({
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      title,
      image,
    },
  })

  if (!result) {
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

  const prisma = getPrismaWithD1()
  const result = await prisma.collection.update({
    where: { id: Number.parseInt(id) },
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      title,
      image,
    },
  })

  if (!result) {
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

  const prisma = getPrismaWithD1()
  const result = await prisma.album.create({
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    },
  })

  if (!result) {
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

  const prisma = getPrismaWithD1()
  const result = await prisma.album.update({
    where: { id: Number.parseInt(id) },
    data: {
      updatedAt: 'CURRENT_TIMESTAMP',
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    },
  })

  if (!result) {
    return 'Failed to update data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function getShortcuts() {
  const prisma = getPrismaWithD1()
  const shortcuts = await prisma.shortcut.findMany()

  return shortcuts
}

export async function getCollections() {
  const prisma = getPrismaWithD1()
  const collections = await prisma.collection.findMany()

  return collections
}

export async function getAlbums() {
  const prisma = getPrismaWithD1()
  const albums = await prisma.album.findMany()

  return albums
}
