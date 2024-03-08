'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Messages } from '#/get-dictionary'
import { Drawer } from 'vaul'

import { cn } from '#/lib/utils'

type PageDrawerProps = React.ComponentProps<typeof Drawer.Root> &
  React.InputHTMLAttributes<HTMLDivElement> & {
    header?: React.ReactNode
    children: React.ReactNode
    messages: Messages['common']
  }

export default function PageDrawer({
  className,
  header,
  children,
  messages,
  ...rest
}: PageDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const onClose = () => {
    setTimeout(() => {
      router.back()
    }, 0)
  }

  return (
    <Drawer.Root open={open} onClose={onClose} {...rest}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex h-[96%] flex-col rounded-t-[10px] bg-white outline-none will-change-transform dark:bg-black',
            className,
          )}
        >
          <div className="p-safe-max-4 flex justify-between">
            <button
              className="text-lg text-blue-500 active:text-blue-500/80"
              onClick={() => setOpen(false)}
            >
              {messages['cancel']}
            </button>

            {header}
          </div>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
