'use client'

import { Cell } from '@church/ui/atoms/Cell'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { useTableContext } from '../Table.context'
import { rowSurface } from '../Table.styles'
import { useDraggingColumnId } from '../hooks/useColumnDragDrop'
import { ColumnDefinition, TableRowData } from '../Table.types'

type TableCellProps = {
  column: ColumnDefinition
  /** Only used by the column layout, where no element spans a row and the
   * row-level treatment has to be resolved per cell (FR-021). */
  resolveRowSurface?: boolean
  row: TableRowData
}

export const TableCell = ({
  column,
  resolveRowSurface = false,
  row
}: TableCellProps) => {
  const { isRowSelected, layout } = useTableContext()
  const draggingColumnId = useDraggingColumnId()
  const content = row.cells[column.id]

  // Every cell of the dragged column dims, so the whole column reads as the
  // thing being moved rather than just its header.
  const dragging = draggingColumnId === column.id

  const surface = twMerge(
    resolveRowSurface
      ? rowSurface({
          disabled: row.disabled === true,
          selected: isRowSelected(row.id)
        })
      : undefined,
    dragging ? 'opacity-40' : undefined
  )

  // A row that supplies no value for this column renders an empty cell rather
  // than shifting neighbouring values into the wrong column (FR-031).
  const cell =
    content === undefined ? (
      <Cell label="" type="default" />
    ) : (
      <Cell {...content} />
    )

  if (layout === 'column') {
    return (
      <div
        className={surface}
        data-disabled={row.disabled === true || undefined}
        data-dragging={dragging || undefined}
        data-selected={isRowSelected(row.id) || undefined}
      >
        {cell}
      </div>
    )
  }

  return (
    <td className={surface} data-dragging={dragging || undefined}>
      {cell}
    </td>
  )
}
