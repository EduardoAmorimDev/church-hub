'use client'

import { useTableContext } from '../Table.context'
import { rowSurface } from '../Table.styles'
import { TableCell } from './TableCell'
import { TableSelectionCell } from './TableSelectionCell'
import { TableRowData } from '../Table.types'

type TableRowProps = {
  row: TableRowData
}

/** Row-composed layout. The row container carries fill, divider and state,
 * which is exactly what the column layout cannot do (FR-021). */
export const TableRow = ({ row }: TableRowProps) => {
  const { columns, isRowSelected, selectable } = useTableContext()
  const selected = isRowSelected(row.id)

  return (
    <tr
      aria-selected={selectable ? selected : undefined}
      className={rowSurface({ disabled: row.disabled === true, selected })}
      data-disabled={row.disabled === true || undefined}
      data-selected={selected || undefined}
    >
      {selectable && <TableSelectionCell row={row} />}
      {columns.map(column => (
        <TableCell column={column} key={column.id} row={row} />
      ))}
    </tr>
  )
}
