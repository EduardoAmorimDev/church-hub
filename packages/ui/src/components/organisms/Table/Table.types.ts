import { ReactNode } from 'react'
import { CellAction } from '@church/ui/atoms/Cell'

export type TableLayout = 'row' | 'column'

export type TableState = 'default' | 'loading' | 'error'

export type SortDirection = 'ascending' | 'descending' | 'none'

/** What a data cell renders. Mirrors the `Cell` atom's data variants, minus the
 * check cell, which the table owns for row selection. */
export type CellContent =
  | { label: string; paragraph?: string; type: 'default' }
  | { action?: ReactNode; icon?: ReactNode; tag: ReactNode; type: 'tag' }
  | { actions: ReadonlyArray<CellAction>; type: 'action' }

export type ColumnDefinition = {
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
  className?: string
  columns: ReadonlyArray<ColumnDefinition>
  emptyContent?: ReactNode
  errorContent?: ReactNode
  layout?: TableLayout
  loadingContent?: ReactNode
  onColumnOrderChange?: (columnIds: string[]) => void
  onSelectionChange?: (ids: string[]) => void
  rows: ReadonlyArray<TableRowData>
  selectable?: boolean
  selectedIds?: ReadonlyArray<string>
  state?: TableState
}
