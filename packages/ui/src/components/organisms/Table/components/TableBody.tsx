'use client'

import { useTableContext } from '../Table.context'
import { TableRow } from './TableRow'

/** Body container for the row-composed layout. */
export const TableBody = () => {
  const { rows } = useTableContext()

  return (
    <tbody>
      {rows.map(row => (
        <TableRow key={row.id} row={row} />
      ))}
    </tbody>
  )
}
