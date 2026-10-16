import type { ComponentProps } from 'react'
import { Avatar } from '@church/ui/atoms/Avatar'
import { Icon } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'
import { MenuDropdown } from '@church/ui/molecules/MenuDropdown'
import type { MenuItemProps } from '@church/ui/molecules/MenuDropdown'
import type { NavUser } from '../SideMenu.types'

const profile = tv({
  slots: {
    root: [
      'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start',
      'text-primary transition-colors hover:bg-hover'
    ],
    text: 'flex min-w-0 flex-1 flex-col',
    name: 'text-size-50 truncate font-medium text-primary',
    role: 'text-size-25 truncate font-normal text-secondary',
    icon: 'shrink-0 text-current'
  },
  variants: {
    collapsed: {
      true: { root: 'justify-center p-1' }
    }
  }
})

type MenuTriggerAttributes = Pick<
  ComponentProps<'button'>,
  'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'onClick'
>

export type ProfileButtonProps = MenuTriggerAttributes & {
  user: NavUser
  collapsed?: boolean
  /** invariant: with items, the button opens them in a menu above it; the
   * profile sits at the bottom of the screen. */
  menuItems?: MenuItemProps[]
}

export const ProfileButton = ({
  collapsed = false,
  menuItems = [],
  user,
  ...trigger
}: ProfileButtonProps) => {
  const slots = profile({ collapsed })
  const collapsedLabel = user.role ? `${user.name}, ${user.role}` : user.name

  const button = (
    <button
      {...trigger}
      aria-label={collapsed ? collapsedLabel : undefined}
      className={slots.root()}
      type="button"
    >
      <Avatar alt={user.name} decorative size="small" src={user.src ?? ''} />
      {!collapsed && (
        <>
          <span className={slots.text()}>
            <span className={slots.name()}>{user.name}</span>
            {user.role && <span className={slots.role()}>{user.role}</span>}
          </span>
          <Icon className={slots.icon()} name="expand_more" size="large" />
        </>
      )}
    </button>
  )

  if (menuItems.length === 0) return button

  return (
    <MenuDropdown
      items={menuItems}
      label="Menu do perfil"
      side="top"
      trigger={button}
    />
  )
}
