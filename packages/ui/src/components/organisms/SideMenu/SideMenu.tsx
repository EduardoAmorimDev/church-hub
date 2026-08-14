'use client'

import { useState } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { Logo } from '@church/ui/atoms/Logo'
import { NavItem } from '@church/ui/atoms/NavItem'
import { tv } from '@church/ui/lib/tailwind-variants'
import { Navigation } from '@church/ui/molecules/Navigation'
import { ProfileButton } from './components'
import { SideMenuProps } from './SideMenu.types'

const sideMenu = tv({
  slots: {
    root: [
      'flex h-full shrink-0 flex-col border-r border-default bg-surface',
      'transition-width duration-300 ease-out'
    ],
    head: [
      'relative flex h-16 shrink-0 items-center justify-between',
      'border-b border-default px-4'
    ],
    // why: Lamb pins the button 18px down and 14px past the edge, so it sits
    // on the menu's border line; `z-2` keeps it over the content beside it.
    collapse: [
      'absolute top-4.5 -right-3.5 z-2 inline-flex size-7 items-center justify-center',
      'rounded-full border border-neutral-17 bg-surface text-neutral-83',
      'transition-colors hover:bg-hover'
    ],
    middle: 'min-h-0 flex-1 overflow-y-auto px-1.5 py-4',
    footer: 'flex flex-col gap-2 border-t border-default px-1.5 pt-3 pb-4',
    footerList: 'flex flex-col gap-2'
  },
  variants: {
    collapsed: {
      true: {
        root: 'w-sidebar-collapsed',
        head: 'px-3',
        middle: 'px-4',
        footer: 'px-4 py-3'
      },
      false: {
        root: 'w-sidebar'
      }
    }
  }
})

export const SideMenu = ({
  className,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  footerItems = [],
  items,
  label = 'Menu principal',
  logo,
  onCollapsedChange,
  onProfileClick,
  user
}: SideMenuProps) => {
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed)
  const collapsed = collapsedProp ?? innerCollapsed
  const slots = sideMenu({ collapsed })

  const toggle = () => {
    const next = !collapsed
    if (collapsedProp === undefined) setInnerCollapsed(next)
    onCollapsedChange?.(next)
  }

  return (
    <aside className={slots.root({ className })} data-collapsed={collapsed}>
      <div className={slots.head()}>
        {logo ??
          (collapsed ? (
            <Logo className="h-8" variant="symbol" />
          ) : (
            <Logo className="h-9" variant="full" />
          ))}
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className={slots.collapse()}
          onClick={toggle}
          type="button"
        >
          <Icon
            className="text-current"
            name={collapsed ? 'chevron_right' : 'chevron_left'}
            size="medium"
          />
        </button>
      </div>

      <div className={slots.middle()}>
        <Navigation aria-label={label} collapsed={collapsed} items={items} />
      </div>

      <div className={slots.footer()}>
        {footerItems.length > 0 && (
          <ul className={slots.footerList()}>
            {footerItems.map((item, index) => (
              <NavItem key={index} {...item} collapsed={collapsed} />
            ))}
          </ul>
        )}
        {user && (
          <ProfileButton
            collapsed={collapsed}
            onClick={onProfileClick}
            user={user}
          />
        )}
      </div>
    </aside>
  )
}
