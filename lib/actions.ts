'use server'

import { z } from 'zod'

import prisma from '#/lib/prisma'
import { ShortcutRecord } from '#/app/api/icloud/[uuid]/shortcut'

const schema = z.object({
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
  }
  message?: string | null
}

export async function getShortcutByiCloud(
  prevState: State,
  formData: FormData,
) {
  const validatedFields = schema.safeParse({
    icloud: formData.get('icloud'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data',
    }
  }

  const { icloud } = validatedFields.data
  const uuid = new URL(icloud).pathname.split('/').pop()

  const shortcutExists = await prisma.shortcut.findFirst({
    where: {
      icloud: {
        contains: uuid,
      },
    },
  })

  if (shortcutExists) {
    return {
      message: 'Shortcut already exists.',
    }
  }

  const res = await fetch(
    `https://www.icloud.com/shortcuts/api/records/${uuid}`,
  )

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data: ShortcutRecord = await res.json()

  return {
    data,
  }
}
