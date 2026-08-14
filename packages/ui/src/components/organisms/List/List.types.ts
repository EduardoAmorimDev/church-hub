import { ReactElement, ReactNode } from 'react'
import type { EmptyStateProps } from '@church/ui/molecules/EmptyState'
import type { ListItemProps } from '@church/ui/molecules/ListItem'

export type ListDensity = NonNullable<ListItemProps['density']>

export type ListProps = {
  /** why: ListItems, or ListSections holding ListItems. */
  children?: ReactNode
  /** invariant: names a `role="region"`; without it the List has no role. */
  label?: string
  /** invariant: applied to each ListItem that sets no `density` itself. */
  density?: ListDensity
  /** invariant: wins over `empty`. */
  loading?: boolean
  skeletonCount?: number
  /** why: props become an inline small EmptyState; an element renders as is. */
  empty?: EmptyStateProps | ReactElement
  className?: string
}

export type ListSectionProps = {
  title: ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
  children?: ReactNode
}
