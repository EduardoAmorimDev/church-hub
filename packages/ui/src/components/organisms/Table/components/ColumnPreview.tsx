'use client'

import { Cell } from '@church/ui/atoms/Cell'
import { ColumnDefinition, TableRowData } from '../Table.types'

type ColumnPreviewProps = {
  column: ColumnDefinition
  rows: ReadonlyArray<TableRowData>
}

/** The drag preview: a whole column, header plus one cell per row. This is what
 * makes dragging move the entire column rather than just its header. */
export const ColumnPreview = ({ column, rows }: ColumnPreviewProps) => (
  <div
    className="bg-neutral-00 flex flex-col rounded-lg shadow-lg"
    data-testid="column-preview"
  >
    <Cell heading label={column.header} type="default" />
    {rows.map(row => {
      const content = row.cells[column.id]

      return content === undefined ? (
        <Cell key={row.id} label="" type="default" />
      ) : (
        <Cell key={row.id} {...content} />
      )
    })}
  </div>
)
