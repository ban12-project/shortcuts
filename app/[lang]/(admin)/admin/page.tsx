import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Album, Collection, Shortcut } from '@prisma/client'

import { cn } from '#/lib/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import Link from '#/components/link'

type Columns<T> = {
  key: (keyof T extends string ? keyof T : never) | 'custom'
  header: ((item: T, colIndex: number) => React.ReactNode) | string
  cell: (item: T, colIndex: number, rowIndex: number) => React.ReactNode
  className?: string
}[]

const shortcutsTableColumns: Columns<Shortcut> = [
  {
    key: 'id',
    header: 'id',
    cell: (shortcut) => shortcut.id,
    className: 'sticky left-0',
  },
  {
    key: 'createdAt',
    header: 'createdAt',
    cell: (shortcut) => shortcut.createdAt.toString(),
  },
  {
    key: 'updatedAt',
    header: 'updatedAt',
    cell: (shortcut) => shortcut.updatedAt.toString(),
  },
  {
    key: 'icloud',
    header: 'icloud',
    cell: (shortcut) => shortcut.icloud,
  },
  {
    key: 'name',
    header: 'name',
    cell: (shortcut) => shortcut.name,
  },
  {
    key: 'description',
    header: 'description',
    cell: (shortcut) => shortcut.description,
  },
  {
    key: 'icon',
    header: 'icon',
    cell: (shortcut) => shortcut.icon,
  },
  {
    key: 'backgroundColor',
    header: 'backgroundColor',
    cell: (shortcut) => shortcut.backgroundColor,
  },
  {
    key: 'details',
    header: 'details',
    cell: (shortcut) => shortcut.details,
  },
  {
    key: 'language',
    header: 'language',
    cell: (shortcut) => shortcut.language,
  },
  {
    key: 'collectionId',
    header: 'collectionId',
    cell: (shortcut) => shortcut.collectionId,
    className: 'sticky right-20',
  },
  {
    key: 'albumId',
    header: 'albumId',
    cell: (shortcut) => shortcut.albumId,
    className: 'sticky right-10',
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (shortcut) => (
      <Link href={`/admin/shortcut/${shortcut.id}`}>edit</Link>
    ),
    className: 'sticky right-0 text-right',
  },
]

const collectionsTableColumns: Columns<Collection> = [
  {
    key: 'id',
    header: 'id',
    cell: (collection) => collection.id,
    className: 'sticky left-0',
  },
  {
    key: 'title',
    header: 'title',
    cell: (collection) => collection.title,
  },
  {
    key: 'image',
    header: 'image',
    cell: (collection) => collection.image,
    className: 'w-24',
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (collection) => (
      <Link href={`/admin/collection/${collection.id}`}>edit</Link>
    ),
    className: 'sticky right-0 text-right',
  },
]

const albumsTableColumns: Columns<Album> = [
  {
    key: 'id',
    header: 'id',
    cell: (album) => album.id,
    className: 'sticky left-0',
  },
  {
    key: 'title',
    header: 'title',
    cell: (album) => album.title,
  },
  {
    key: 'description',
    header: 'description',
    cell: (album) => album.description,
  },
  {
    key: 'collectionId',
    header: 'collectionId',
    cell: (album) => album.collectionId,
  },
  {
    key: 'createdAt',
    header: 'createdAt',
    cell: (album) => album.createdAt.toString(),
  },
  {
    key: 'updatedAt',
    header: 'updatedAt',
    cell: (album) => album.updatedAt.toString(),
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (album) => <Link href={`/admin/album/${album.id}`}>edit</Link>,
    className: 'sticky right-0 text-right',
  },
]

function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  children,
}: {
  columns: Columns<T>
  data: T[]
  children: React.ReactNode
}) {
  return (
    <Table className="overflow-auto overscroll-x-contain [&_.sticky]:bg-white">
      <TableCaption className="sticky bottom-0">
        {children}
        total: {data.length}
      </TableCaption>
      <TableHeader className="sticky top-0 z-10 bg-white dark:bg-black">
        <TableRow>
          {columns.map((col, colIndex) => (
            <TableHead
              key={col.key}
              className={cn(col.className, 'capitalize')}
            >
              {typeof col.header === 'string'
                ? col.header
                : col.header(data[colIndex], colIndex)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow key={item.id}>
            {columns.map((col, colIndex) => (
              <TableCell key={col.key} className={col.className}>
                {col.cell(item, colIndex, rowIndex)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default async function AdminPage() {
  const db = getRequestContext().env.DB
  const [
    { results: shortcuts },
    { results: collections },
    { results: albums },
  ] = await Promise.all([
    db.prepare(`SELECT * FROM Shortcut`).all<Shortcut>(),
    db.prepare(`SELECT * FROM Collection`).all<Collection>(),
    db.prepare(`SELECT * FROM Album`).all<Album>(),
  ])

  return (
    <main className="grid h-[calc(100vh-40px)] grid-rows-3 gap-3 lg:grid-cols-3 lg:grid-rows-1">
      <AdminTable columns={shortcutsTableColumns} data={shortcuts}>
        <Link className="mr-2" href={`/admin/shortcut/create`}>
          Create
        </Link>
      </AdminTable>
      <AdminTable columns={collectionsTableColumns} data={collections}>
        <Link className="mr-2" href={`/admin/collection/create`}>
          Create
        </Link>
      </AdminTable>
      <AdminTable columns={albumsTableColumns} data={albums}>
        <Link className="mr-2" href={`/admin/album/create`}>
          Create
        </Link>
      </AdminTable>
    </main>
  )
}

export const runtime = 'edge'
