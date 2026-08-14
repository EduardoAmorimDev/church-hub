'use client'

import { Cell } from '@church/ui/atoms/Cell'
import { useTableContext } from '../Table.context'
import { rowSurface } from '../Table.styles'
import { TableRowData } from '../Table.types'

/** The 32px selection column (FR-018). Always first, never reorderable. */
export const TableSelectionHead = () => {
  const { headerSelectionState, layout, toggleAllRows } = useTableContext()

  const control = (
    <Cell
      aria-label="Selecionar todas as linhas"
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

  return <th scope="col">{control}</th>
}

type TableSelectionCellProps = {
  resolveRowSurface?: boolean
  row: TableRowData
}

export const TableSelectionCell = ({
  resolveRowSurface = false,
  row
}: TableSelectionCellProps) => {
  const { isRowSelected, layout, toggleRow } = useTableContext()
  const selected = isRowSelected(row.id)

  const surface = resolveRowSurface
    ? rowSurface({ disabled: row.disabled === true, selected })
    : undefined

  const control = (
    <Cell
      aria-label={`Selecionar linha ${row.id}`}
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

  return <td className={surface}>{control}</td>
}
