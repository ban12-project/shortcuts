'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Messages } from '#/get-dictionary'
import { Drawer } from 'vaul'

import { cn } from '#/lib/utils'
import { useResponsive } from '#/hooks/use-responsive'

import { Button } from './button'

type PageDrawerProps = React.ComponentProps<typeof Drawer.Root> &
  React.InputHTMLAttributes<HTMLDivElement> & {
    header?: React.ReactNode
    children: React.ReactNode
    messages: Messages['common']
  }

export const PAGE_DRAWER_HEADER_ID = 'PAGE_DRAWER_HEADER_ID'

export default function PageDrawer({
  className,
  header,
  children,
  messages,
  ...rest
}: PageDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const breakpoints = useResponsive()

  const onClose = () => {
    setTimeout(() => {
      router.back()
    }, 300) // delay 300ms to wait for drawer close animation
  }

  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      direction={breakpoints.lg ? 'right' : 'bottom'}
      {...rest}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex h-[96%] flex-col rounded-t-[10px] bg-white outline-none dark:bg-black lg:left-auto lg:h-full lg:w-[460px] lg:rounded-none',
            className,
          )}
        >
          <div
            className="flex justify-between p-safe-max-4"
            id={PAGE_DRAWER_HEADER_ID}
          >
            <Button variant="ios" size="auto" onClick={() => setOpen(false)}>
              {messages['cancel']}
            </Button>

            {header}
          </div>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
