'use client'

import { useRef } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { Logo } from '@church/ui/atoms/Logo'
import { NavItem } from '@church/ui/atoms/NavItem'
import { tv } from '@church/ui/lib/tailwind-variants'
import { Navigation } from '@church/ui/molecules/Navigation'
import { ProfileButton } from '@church/ui/organisms/SideMenu/components'
import { useModalLayer } from '@church/ui/utils'
import { MenuDrawerProps } from './MenuDrawer.types'

const menuDrawer = tv({
  slots: {
    scrim: 'fixed inset-0 z-40 bg-scrim',
    panel: [
      'fixed top-0 bottom-0 z-41 flex w-menu-drawer max-w-full flex-col',
      'bg-surface'
    ],
    bar: [
      'flex h-16 shrink-0 items-center justify-between',
      'border-b border-default bg-surface px-5'
    ],
    middle: 'min-h-0 flex-1 overflow-y-auto px-5 py-4',
    footer: 'flex flex-col gap-2 border-t border-default px-5 pt-3 pb-5',
    footerList: 'flex flex-col gap-2'
  },
  variants: {
    side: {
      right: { panel: 'right-0 shadow-elevation-low-left' },
      left: { panel: 'left-0 shadow-elevation-low-right' }
    }
  },
  defaultVariants: { side: 'right' }
})

export const MenuDrawer = ({
  footerItems = [],
  items,
  label = 'Menu principal',
  onClose,
  onProfileClick,
  open,
  profileMenuItems,
  side = 'right',
  user
}: MenuDrawerProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const layer = useModalLayer(open, {
    ref: panelRef,
    onEscape: () => onClose(),
    initialFocus: () => closeRef.current
  })

  if (!open) return null

  const slots = menuDrawer({ side })

  return (
    <>
      <div aria-hidden="true" className={slots.scrim()} onClick={onClose} />
      {/* why: `data-viewport="mobile"` keeps the NavItems at 48px (App
          density) at any window width. */}
      <div
        aria-label={label}
        aria-modal="true"
        className={slots.panel()}
        data-side={side}
        data-viewport="mobile"
        onKeyDown={layer.onKeyDown}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className={slots.bar()}>
          <Logo className="h-9" variant="full" />
          <IconButton
            aria-label="Fechar menu"
            color="neutral"
            onClick={onClose}
            ref={closeRef}
            size="medium"
            variant="ghost"
          >
            <Icon name="close" />
          </IconButton>
        </div>

        <div className={slots.middle()}>
          <Navigation aria-label={label} collapsed={false} items={items} />
        </div>

        <div className={slots.footer()}>
          {footerItems.length > 0 && (
            <ul className={slots.footerList()}>
              {footerItems.map((item, index) => (
                <NavItem key={index} {...item} collapsed={false} />
              ))}
            </ul>
          )}
          {user && (
            <ProfileButton
              menuItems={profileMenuItems}
              onClick={onProfileClick}
              user={user}
            />
          )}
        </div>
      </div>
    </>
  )
}
