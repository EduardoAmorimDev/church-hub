'use client'

import { useTableContext } from '../Table.context'
import { table } from '../Table.styles'
import { useColumnSortable } from '../hooks/useColumnDragDrop'
import { TableCell } from './TableCell'
import { TableHead } from './TableHead'
import { TableSelectionCell, TableSelectionHead } from './TableSelectionCell'
import { ColumnDefinition } from '../Table.types'

const SELECTION_COLUMN_ID = '__selection__'

type TableColumnProps = {
  /** Absent for the selection column, which is not reorderable. */
  column?: ColumnDefinition
  index: number
}

/** Column-composed layout. Here the whole column is a single DOM node, so the
 * column container — not its header — is what registers as sortable; otherwise
 * dragging would move only the header. Row-level treatment still resolves per
 * cell, because no element spans a row (FR-021). */
export const TableColumn = ({ column, index }: TableColumnProps) => {
  const { rows } = useTableContext()
  const slots = table()
  const sortable = useColumnSortable(
    column?.id ?? SELECTION_COLUMN_ID,
    index,
    column === undefined || column.reorderable === false
  )

  return (
    <div
      className={slots.column()}
      ref={sortable.ref}
      role="presentation"
      data-dragging={sortable.isDragging || undefined}
    >
      {column === undefined ? (
        <TableSelectionHead />
      ) : (
        <TableHead
          column={column}
          dragHandleRef={sortable.handleRef}
          index={index}
        />
      )}
      {rows.map(row =>
        column === undefined ? (
          <TableSelectionCell key={row.id} resolveRowSurface row={row} />
        ) : (
          <TableCell column={column} key={row.id} resolveRowSurface row={row} />
        )
      )}
    </div>
  )
}
