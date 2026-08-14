import type { ReactNode } from 'react'
import type { SideMenuProps } from '@church/ui/organisms/SideMenu'

export type PageProps = {
  /** invariant: without it the page has no SideMenu. */
  nav?: SideMenuProps
  /** invariant: rendered first inside `<main>`, before the children. */
  header?: ReactNode
  children?: ReactNode
  /** invariant: with `nav`, below 960px the SideMenu gives way to a top bar
   * and the MenuDrawer (CSS only); `false` keeps the SideMenu everywhere. */
  responsive?: boolean
  /** invariant: "Pular para o conteúdo" by default. */
  skipLinkLabel?: string
}

export type PageBodyProps = {
  /** invariant: laid out in the auto-fit grid, before the children. */
  stats?: ReactNode
  children?: ReactNode
}
