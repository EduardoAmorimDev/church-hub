'use client'

import { ReactNode, useCallback, useMemo } from 'react'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { TableProvider } from './Table.context'
import { table as tableStyles } from './Table.styles'
import {
  ColumnDragDropProvider,
  ColumnDragOverlay
} from './hooks/useColumnDragDrop'
import { ColumnPreview } from './components'
import { useColumnOrder } from './hooks/useColumnOrder'
import {
  TableBody,
  TableCell,
  TableColumn,
  TableHead,
  TableHeader,
  TableRow
} from './components'
import { TableSelectionCell, TableSelectionHead } from './components'
import { HeaderSelectionState, TableProps } from './Table.types'

type TableRootProps = TableProps & { children?: ReactNode }

const deriveHeaderSelection = (
  selectableIds: ReadonlyArray<string>,
  selected: ReadonlySet<string>
): HeaderSelectionState => {
  if (selectableIds.length === 0) return 'none'

  const count = selectableIds.filter(id => selected.has(id)).length

  if (count === 0) return 'none'

  return count === selectableIds.length ? 'all' : 'partial'
}

export const Table = ({
  caption,
  children,
  className,
  columns,
  emptyContent,
  errorContent,
  layout = 'row',
  loadingContent,
  onColumnOrderChange,
  onSelectionChange,
  rows,
  selectable = true,
  selectedIds,
  state = 'default'
}: TableRootProps) => {
  const slots = tableStyles()
  const { columnIds, moveColumn, orderedColumns, setOrder } = useColumnOrder(
    columns,
    onColumnOrderChange
  )

  const selected = useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const selectableIds = useMemo(
    () => rows.filter(row => row.disabled !== true).map(row => row.id),
    [rows]
  )
  const headerSelectionState = deriveHeaderSelection(selectableIds, selected)

  const isRowSelected = useCallback(
    (rowId: string) => selected.has(rowId),
    [selected]
  )

  const toggleRow = useCallback(
    (rowId: string) => {
      const next = new Set(selected)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      onSelectionChange?.(Array.from(next))
    },
    [onSelectionChange, selected]
  )

  // Disabled rows are never picked up by the header checkbox (FR-029).
  const toggleAllRows = useCallback(() => {
    onSelectionChange?.(
      headerSelectionState === 'all' ? [] : [...selectableIds]
    )
  }, [headerSelectionState, onSelectionChange, selectableIds])

  const contextValue = useMemo(
    () => ({
      columns: orderedColumns,
      headerSelectionState,
      isRowSelected,
      layout,
      moveColumn,
      rows,
      selectable,
      toggleAllRows,
      toggleRow
    }),
    [
      headerSelectionState,
      isRowSelected,
      layout,
      moveColumn,
      orderedColumns,
      rows,
      selectable,
      toggleAllRows,
      toggleRow
    ]
  )

  const stateContent =
    state === 'loading'
      ? (loadingContent ?? 'Carregando…')
      : state === 'error'
        ? (errorContent ?? 'Não foi possível carregar os dados.')
        : rows.length === 0
          ? (emptyContent ?? 'Nenhum registro encontrado.')
          : null

  // Column headers stay visible in every non-default state so the table's shape
  // remains legible (FR-030).
  const body =
    stateContent === null ? (
      <TableBody />
    ) : (
      <tbody>
        <tr>
          <td colSpan={orderedColumns.length + (selectable ? 1 : 0)}>
            <div className={slots.stateMessage()}>{stateContent}</div>
          </td>
        </tr>
      </tbody>
    )

  const defaultComposition =
    layout === 'column' ? (
      <div aria-label={caption} className={slots.columnGrid()} role="group">
        {selectable && <TableColumn index={-1} />}
        {orderedColumns.map((column, index) => (
          <TableColumn column={column} index={index} key={column.id} />
        ))}
      </div>
    ) : (
      <table className={slots.grid()}>
        <caption className={slots.caption()}>{caption}</caption>
        <TableHeader />
        {body}
      </table>
    )

  return (
    <TableProvider value={contextValue}>
      <ColumnDragDropProvider columnIds={columnIds} onReorder={setOrder}>
        <div className={twMerge(slots.root(), className)}>
          {children ?? defaultComposition}
        </div>
        <ColumnDragOverlay>
          {columnId => {
            const dragged = orderedColumns.find(
              column => column.id === columnId
            )

            return dragged === undefined ? null : (
              <ColumnPreview column={dragged} rows={rows} />
            )
          }}
        </ColumnDragOverlay>
      </ColumnDragDropProvider>
    </TableProvider>
  )
}

Table.Body = TableBody
Table.Cell = TableCell
Table.Column = TableColumn
Table.Head = TableHead
Table.Header = TableHeader
Table.Row = TableRow
Table.SelectionCell = TableSelectionCell
Table.SelectionHead = TableSelectionHead
