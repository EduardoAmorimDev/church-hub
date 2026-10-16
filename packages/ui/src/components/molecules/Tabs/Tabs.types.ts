export type TabItem = {
  label: string
  href: string
  /** invariant: the tab of the page being shown; gets `aria-current="page"`. */
  current?: boolean
}

export type TabsProps = {
  /** invariant: names the `<nav>`. */
  label: string
  items: ReadonlyArray<TabItem>
  className?: string
}
