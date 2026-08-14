import { ReactElement, ReactNode } from 'react'
import { AvatarProps } from '@church/ui/atoms/Avatar'
import { CellAction } from '@church/ui/atoms/Cell'
import { IconProps } from '@church/ui/atoms/Icon'

export type TableLayout = 'row' | 'column'

export type TableState = 'default' | 'loading' | 'error'

export type SortDirection = 'ascending' | 'descending' | 'none'

/** Row heights 48, 40 and 32px. */
export type TableDensity = 'default' | 'compact' | 'dense'

export type ColumnAlign = 'left' | 'right'

/** What a data cell renders. Mirrors the `Cell` atom's data variants, minus the
 * check cell, which the table owns for row selection. */
export type CellContent =
  | {
      icon?: ReactElement<IconProps>
      label: string
      paragraph?: string
      type: 'default'
    }
  | {
      label: string
      paragraph?: string
      src?: AvatarProps['src']
      type: 'avatar'
    }
  | { action?: ReactNode; icon?: ReactNode; tag: ReactNode; type: 'tag' }
  | { actions: ReadonlyArray<CellAction>; type: 'action' }

export type ColumnDefinition = {
  /** Defaults to 'left'. 'right' also sets tabular figures, for numbers. */
  align?: ColumnAlign
  header: string
  headerIconLeft?: ReactNode
  headerIconRight?: ReactNode
  /** Stable identity. Survives reordering and is how rows address their cells. */
  id: string
  /** Defaults to true. The selection column is always false. */
  reorderable?: boolean
  sortDirection?: SortDirection
  sortable?: boolean
}

export type TableRowData = {
  /** Keyed by column id, never by position — a missing key renders an empty
   * cell instead of shifting values into neighbouring columns (FR-031). */
  cells: Record<string, CellContent>
  disabled?: boolean
  id: string
}

/** Derived from the selection, never stored (see data-model.md). */
export type HeaderSelectionState = 'none' | 'partial' | 'all'

export type TableProps = {
  /** Accessible name for the table. */
  caption: string
  /** Keeps the caption as the accessible name but hides it visually. */
  captionHidden?: boolean
  className?: string
  columns: ReadonlyArray<ColumnDefinition>
  density?: TableDensity
  emptyContent?: ReactNode
  errorContent?: ReactNode
  layout?: TableLayout
  loadingContent?: ReactNode
  onColumnOrderChange?: (columnIds: string[]) => void
  onSelectionChange?: (ids: string[]) => void
  /** invariant: reports the next direction, never 'none': none and
   * descending go to ascending, ascending goes to descending. */
  onSortChange?: (
    columnId: string,
    direction: Exclude<SortDirection, 'none'>
  ) => void
  rows: ReadonlyArray<TableRowData>
  selectable?: boolean
  selectedIds?: ReadonlyArray<string>
  state?: TableState
}
