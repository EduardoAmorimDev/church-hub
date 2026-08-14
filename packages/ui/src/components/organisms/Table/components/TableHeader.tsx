'use client'

import { useTableContext } from '../Table.context'
import { TableHead } from './TableHead'
import { TableSelectionHead } from './TableSelectionCell'

/** Header container for the row-composed layout. The column layout builds its
 * own header inside each `TableColumn`. */
export const TableHeader = () => {
  const { columns, selectable } = useTableContext()

  return (
    <thead>
      <tr>
        {selectable && <TableSelectionHead />}
        {columns.map((column, index) => (
          <TableHead column={column} index={index} key={column.id} />
        ))}
      </tr>
    </thead>
  )
}
