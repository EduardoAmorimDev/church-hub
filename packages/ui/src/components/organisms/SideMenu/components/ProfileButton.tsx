import type { MouseEventHandler } from 'react'
import { Avatar } from '@church/ui/atoms/Avatar'
import { Icon } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'
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

export type ProfileButtonProps = {
  user: NavUser
  collapsed?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export const ProfileButton = ({
  collapsed = false,
  onClick,
  user
}: ProfileButtonProps) => {
  const slots = profile({ collapsed })
  const collapsedLabel = user.role ? `${user.name}, ${user.role}` : user.name

  return (
    <button
      aria-label={collapsed ? collapsedLabel : undefined}
      className={slots.root()}
      onClick={onClick}
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
}
