import type { MouseEventHandler, ReactNode } from 'react'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import type { MenuItemProps } from '@church/ui/molecules/MenuDropdown'

/** invariant: `src` is the photo, as in the Avatar; without it the Avatar
 * shows the initials of `name`. */
export type NavUser = {
  name: string
  role?: string
  src?: string
}

export type SideMenuProps = {
  items: NavItemProps[]
  footerItems?: NavItemProps[]
  user?: NavUser
  onProfileClick?: MouseEventHandler<HTMLButtonElement>
  /** invariant: with `user`, the profile button opens these in a menu above
   * it; without them it only calls `onProfileClick`. */
  profileMenuItems?: MenuItemProps[]
  /** invariant: controlled when set; otherwise the SideMenu keeps its own
   * state, starting from `defaultCollapsed`. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** invariant: names the `<nav>`; "Menu principal" by default. */
  label?: string
  logo?: ReactNode
  className?: string
}
