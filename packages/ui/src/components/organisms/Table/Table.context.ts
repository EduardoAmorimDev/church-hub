'use client'

import { createContext, useContext } from 'react'
import {
  ColumnDefinition,
  HeaderSelectionState,
  TableLayout,
  TableRowData
} from './Table.types'

export type TableContextValue = {
  /** Columns in their current display order. Excludes the selection column,
   * which is rendered separately and never reordered. */
  columns: ReadonlyArray<ColumnDefinition>
  headerSelectionState: HeaderSelectionState
  isRowSelected: (rowId: string) => boolean
  layout: TableLayout
  /** Moves `activeId` to `overId`'s position. Out-of-range ids are ignored. */
  moveColumn: (activeId: string, overId: string) => void
  rows: ReadonlyArray<TableRowData>
  selectable: boolean
  toggleAllRows: () => void
  toggleRow: (rowId: string) => void
}

// No default value: a sub-component rendered outside the root must fail loudly
// rather than render something subtly wrong (research.md R3).
const TableContext = createContext<TableContextValue | null>(null)

export const TableProvider = TableContext.Provider

export const useTableContext = (): TableContextValue => {
  const context = useContext(TableContext)

  if (context === null) {
    throw new Error(
      'Table sub-components must be rendered inside <Table>. ' +
        'Wrap them in the Table root before using them.'
    )
  }

  return context
}
