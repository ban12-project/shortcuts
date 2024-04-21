import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Shortcut } from '@prisma/client'

import Link from '#/components/link'

export default async function AdminPage() {
  const db = getRequestContext().env.DB
  const { results: shortcuts } = await db
    .prepare(`SELECT * FROM Shortcut`)
    .all<Shortcut>()

  return (
    <main>
      <div className="w-full overflow-auto">
        <table className="table-auto border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                actions
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                id
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                createdAt
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                updatedAt
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                icloud
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                name
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                description
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                icon
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                backgroundColor
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                details
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                language
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                collectionId
              </th>
              <th className="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                albumId
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800">
            {shortcuts.map((shortcut) => (
              <tr key={shortcut.id}>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <Link href={`/admin/${shortcut.id}`}>edit</Link>
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.id}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.createdAt as unknown as string}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.updatedAt as unknown as string}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.icloud}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.name}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.description}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.icon}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.backgroundColor}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.details}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.language}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.collectionId}
                </td>
                <td className="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {shortcut.albumId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export const runtime = 'edge'
