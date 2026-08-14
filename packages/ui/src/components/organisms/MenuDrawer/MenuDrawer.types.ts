import type { MouseEventHandler } from 'react'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import type { NavUser } from '@church/ui/organisms/SideMenu'

export type MenuDrawerProps = {
  open: boolean
  /** invariant: called once per exit (Esc, scrim, "Fechar menu"); the
   * consumer sets `open` to false. */
  onClose: () => void
  /** why: opens on the side of the menu button; the top bar keeps it on the
   * right, so `right` is the default. */
  side?: 'left' | 'right'
  items: NavItemProps[]
  footerItems?: NavItemProps[]
  user?: NavUser
  onProfileClick?: MouseEventHandler<HTMLButtonElement>
  /** invariant: names the dialog and its `<nav>`; "Menu principal" by
   * default. */
  label?: string
}
