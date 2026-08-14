'use client'

import { useTableContext } from '../Table.context'
import { table } from '../Table.styles'
import { TableHead } from './TableHead'
import { TableSelectionHead } from './TableSelectionCell'

/** Header container for the row-composed layout. The column layout builds its
 * own header inside each `TableColumn`. */
export const TableHeader = () => {
  const { columns, selectable } = useTableContext()
  const slots = table()

  return (
    <thead>
      <tr className={slots.headerRow()}>
        {selectable && <TableSelectionHead />}
        {columns.map((column, index) => (
          <TableHead column={column} index={index} key={column.id} />
        ))}
      </tr>
    </thead>
  )
}
