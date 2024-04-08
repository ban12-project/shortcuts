import { LinkProps } from 'next/link'
import { Shortcut } from '@prisma/client'
import { Layers2, Plus } from 'lucide-react'

import { cn } from '#/lib/utils'
import Link from '#/components/link'

interface ShortcutCardProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  item: Shortcut
}

export default function ShortcutCard({
  item,
  className,
  ...props
}: ShortcutCardProps) {
  return (
    <Link
      className={cn(
        'relative flex-none overflow-hidden rounded-3xl bg-gradient-to-br from-red-400 to-red-500 text-zinc-100 transition-[filter] active:brightness-75',
        className,
      )}
      {...props}
    >
      <h3 className="absolute bottom-3 left-3 right-3 max-h-12 overflow-hidden text-lg font-semibold leading-6">
        {item.name}
      </h3>

      <Layers2 className="absolute left-3 top-3 origin-top-left scale-125" />

      <button
        type="button"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white bg-opacity-30"
      >
        <Plus />
      </button>
    </Link>
  )
}
