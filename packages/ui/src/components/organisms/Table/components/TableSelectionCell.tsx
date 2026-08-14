'use client'

import { Cell } from '@church/ui/atoms/Cell'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { useTableContext } from '../Table.context'
import { rowSurface, table } from '../Table.styles'
import { ColumnDefinition, TableRowData } from '../Table.types'

// why: Lamb names each row checkbox after the row, read from the first
// displayed column; a row with no text there falls back to its id.
const rowName = (row: TableRowData, firstColumn?: ColumnDefinition) => {
  const content = firstColumn ? row.cells[firstColumn.id] : undefined

  return content?.type === 'default' || content?.type === 'avatar'
    ? content.label
    : row.id
}

/** The 32px selection column (FR-018). Always first, never reorderable. */
export const TableSelectionHead = () => {
  const { headerSelectionState, layout, toggleAllRows } = useTableContext()
  const slots = table()

  const control = (
    <Cell
      aria-label="Selecionar todos"
      checked={headerSelectionState === 'all'}
      heading
      indeterminate={headerSelectionState === 'partial'}
      onCheckedChange={toggleAllRows}
      type="check"
    />
  )

  if (layout === 'column') {
    return <div>{control}</div>
  }

  return (
    <th className={slots.selectionColumn()} scope="col">
      {control}
    </th>
  )
}

type TableSelectionCellProps = {
  resolveRowSurface?: boolean
  row: TableRowData
}

export const TableSelectionCell = ({
  resolveRowSurface = false,
  row
}: TableSelectionCellProps) => {
  const { columns, isRowSelected, layout, toggleRow } = useTableContext()
  const selected = isRowSelected(row.id)
  const slots = table()

  const surface = resolveRowSurface
    ? rowSurface({ disabled: row.disabled === true, selected })
    : undefined

  const control = (
    <Cell
      aria-label={`Selecionar ${rowName(row, columns[0])}`}
      checked={selected}
      disabled={row.disabled}
      onCheckedChange={() => toggleRow(row.id)}
      type="check"
    />
  )

  if (layout === 'column') {
    return (
      <div
        className={surface}
        data-disabled={row.disabled === true || undefined}
        data-selected={selected || undefined}
      >
        {control}
      </div>
    )
  }

  return (
    <td className={twMerge(slots.selectionColumn(), surface)}>{control}</td>
  )
}
