'use client'

import { forwardRef } from 'react'
import _Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = React.ComponentPropsWithRef<typeof _Link>

export function useLink(href: Props['href']) {
  const pathName = usePathname()
  const redirectedPathName = (href: Props['href']) => {
    if (!pathName) return '/'
    const segments = pathName.split('/').slice(0, 2)
    return segments.join('/') + href
  }

  return redirectedPathName(href)
}

export const Link = forwardRef<React.ElementRef<'a'>, Props>(
  function Link({ href, ...rest }, forwardedRef) {
    return <_Link {...rest} ref={forwardedRef} href={useLink(href)} />
  },
)
