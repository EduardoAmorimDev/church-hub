'use client'

import { useId, useState } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { Logo } from '@church/ui/atoms/Logo'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { tv } from '@church/ui/lib/tailwind-variants'
import { MenuDrawer } from '@church/ui/organisms/MenuDrawer'
import { SideMenu } from '@church/ui/organisms/SideMenu'
import { PageBodyProps, PageProps } from './Page.types'

// why: Lamb's skip link stays out of sight until it takes keyboard focus,
// then shows over the page in the top-left corner.
const SKIP_LINK = [
  'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-70',
  'focus:rounded-lg focus:px-3 focus:py-2 focus:bg-action-primary',
  'focus:text-size-50 focus:font-medium focus:text-inverse'
].join(' ')

// invariant: the Painel/App switch is CSS only (Decided 3): SideMenu and top
// bar are always in the markup. App is the base; `panel:` or an ancestor
// `[data-viewport]` picks Painel, so server and client HTML match.
const page = tv({
  slots: {
    root: 'relative flex h-full min-h-150 w-full bg-page text-primary',
    sideMenu: '',
    content: 'flex min-w-0 flex-1 flex-col overflow-y-auto',
    topBar: [
      'flex h-16 shrink-0 items-center justify-between',
      'border-b border-default bg-surface px-5',
      'panel:not-in-data-[viewport=mobile]:hidden in-data-[viewport=desktop]:hidden'
    ],
    main: 'mx-auto w-full max-w-content-max'
  },
  variants: {
    responsive: {
      true: {
        root: [
          'flex-col',
          'panel:not-in-data-[viewport=mobile]:flex-row in-data-[viewport=desktop]:flex-row'
        ],
        sideMenu: [
          'hidden',
          'panel:not-in-data-[viewport=mobile]:flex in-data-[viewport=desktop]:flex'
        ]
      },
      false: {}
    }
  }
})

const withClose = (item: NavItemProps, close: () => void): NavItemProps => {
  // invariant: a parent only expands its sub-list, so only its sub-items
  // close the drawer (criterion 31). Like NavItem, an empty `subItems` is a
  // leaf, so its own click closes the drawer.
  if (item.subItems && item.subItems.length > 0)
    return {
      ...item,
      subItems: item.subItems.map(subItem => ({
        ...subItem,
        onClick: event => {
          close()
          subItem.onClick?.(event)
        }
      }))
    }

  return {
    ...item,
    onClick: event => {
      close()
      item.onClick?.(event)
    }
  }
}

export const Page = ({
  children,
  header,
  nav,
  responsive = true,
  skipLinkLabel = 'Pular para o conteúdo'
}: PageProps) => {
  const mainId = useId()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const switches = Boolean(nav) && responsive
  const slots = page({ responsive: switches })
  const close = () => setDrawerOpen(false)

  return (
    <div className={slots.root()}>
      <a className={SKIP_LINK} href={`#${mainId}`}>
        {skipLinkLabel}
      </a>
      {nav && <SideMenu {...nav} className={slots.sideMenu()} />}
      <div className={slots.content()}>
        {switches && (
          <div className={slots.topBar()}>
            <Logo className="h-8" variant="full" />
            <IconButton
              aria-expanded={drawerOpen}
              aria-label="Abrir menu"
              color="neutral"
              onClick={() => setDrawerOpen(true)}
              size="medium"
              variant="ghost"
            >
              <Icon name="menu" />
            </IconButton>
          </div>
        )}
        <main className={slots.main()} id={mainId} tabIndex={-1}>
          {header}
          {children}
        </main>
      </div>
      {nav && switches && (
        <MenuDrawer
          footerItems={nav.footerItems?.map(item => withClose(item, close))}
          items={nav.items.map(item => withClose(item, close))}
          label={nav.label}
          onClose={close}
          onProfileClick={nav.onProfileClick}
          open={drawerOpen}
          side="right"
          user={nav.user}
        />
      )}
    </div>
  )
}

export const PageBody = ({ children, stats }: PageBodyProps) => (
  <div className="panel:not-in-data-[viewport=mobile]:px-8 flex flex-col gap-4 px-5 pt-4 pb-8 in-data-[viewport=desktop]:px-8">
    {stats && <div className="grid-cols-fill-55 grid gap-4">{stats}</div>}
    {children}
  </div>
)
