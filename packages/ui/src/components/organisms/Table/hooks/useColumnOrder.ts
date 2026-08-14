'use client'

import { useCallback, useMemo } from 'react'
import {
  columnOrderingFeature,
  tableFeatures,
  useTable
} from '@tanstack/react-table'
import { ColumnDefinition } from '../Table.types'

// Only the ordering feature is registered: v9 features are tree-shakable, so
// nothing else is pulled into the bundle. Row selection is deliberately not a
// TanStack feature here — it is controlled by the consumer, and duplicating it
// in the engine would create two sources of truth for the same state.
const features = tableFeatures({ columnOrderingFeature })

type UseColumnOrderResult = {
  /** Current order, as ids. Feeds the drag-and-drop reducer. */
  columnIds: ReadonlyArray<string>
  moveColumn: (activeId: string, overId: string) => void
  orderedColumns: ReadonlyArray<ColumnDefinition>
  setOrder: (nextIds: string[]) => void
}

// The engine here owns column order only, so its row type is irrelevant and the
// data array stays empty; rows are rendered from the component's own props.
type OrderingRow = { id: string }

const NO_ROWS: OrderingRow[] = []

export const useColumnOrder = (
  columns: ReadonlyArray<ColumnDefinition>,
  onColumnOrderChange?: (columnIds: string[]) => void
): UseColumnOrderResult => {
  const columnDefs = useMemo(
    () => columns.map(column => ({ id: column.id })),
    [columns]
  )

  const table = useTable({ columns: columnDefs, data: NO_ROWS, features })

  const stateColumnOrder = table.state.columnOrder
  const columnOrder: ReadonlyArray<string> = useMemo(
    () => stateColumnOrder ?? [],
    [stateColumnOrder]
  )

  const orderedColumns = useMemo(() => {
    if (columnOrder.length === 0) return columns

    const byId = new Map(columns.map(column => [column.id, column]))

    // Fall back to declaration order for any id the engine does not know about,
    // so an unexpected order can never drop a column from the render.
    const ordered = columnOrder
      .map(id => byId.get(id))
      .filter((column): column is ColumnDefinition => column !== undefined)
    const missing = columns.filter(column => !columnOrder.includes(column.id))

    return [...ordered, ...missing]
  }, [columnOrder, columns])

  const columnIds = useMemo(
    () => orderedColumns.map(column => column.id),
    [orderedColumns]
  )

  const setOrder = useCallback(
    (nextIds: string[]) => {
      table.setColumnOrder(nextIds)
      onColumnOrderChange?.(nextIds)
    },
    [onColumnOrderChange, table]
  )

  /** Programmatic and keyboard reordering. Drag and drop does not go through
   * here — it uses the library's own reducer (see useColumnDragDrop). */
  const moveColumn = useCallback(
    (activeId: string, overId: string) => {
      const current = [...columnIds]
      const from = current.indexOf(activeId)
      const to = current.indexOf(overId)

      // Either id being absent means the move targets something we do not own —
      // leave the order untouched rather than guessing (FR-031).
      if (from === -1 || to === -1 || from === to) return

      current.splice(to, 0, ...current.splice(from, 1))
      setOrder(current)
    },
    [columnIds, setOrder]
  )

  return { columnIds, moveColumn, orderedColumns, setOrder }
}
