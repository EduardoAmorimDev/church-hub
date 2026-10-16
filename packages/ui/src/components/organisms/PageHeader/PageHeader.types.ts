import type { ReactNode } from 'react'
import type { BreadcrumbItem } from '@church/ui/molecules/Breadcrumb'

export type PageHeaderProps = {
  /** invariant: `home` shows only the greeting and the description; the
   * breadcrumb and the chips belong to `primary` (the default). */
  type?: 'home' | 'primary'
  title?: ReactNode
  /** invariant: the `home` heading; `title` stands in when it is absent. */
  greeting?: ReactNode
  description?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
  /** invariant: quick filters, grouped as "Filtros rápidos". */
  chips?: ReactNode
  /** why: page-level navigation (a `Tabs`) under the title, as in the
   * Backoffice header (141-4446); `primary` only. */
  tabs?: ReactNode
}
