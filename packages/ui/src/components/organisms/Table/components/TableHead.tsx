'use client'

import { Cell } from '@church/ui/atoms/Cell'
import { Icon } from '@church/ui/atoms/Icon'
import { useTableContext } from '../Table.context'
import { columnAlign, table } from '../Table.styles'
import {
  useColumnSortable,
  useDraggingColumnId
} from '../hooks/useColumnDragDrop'
import { ColumnDefinition, SortDirection } from '../Table.types'

const ariaSortByDirection = {
  ascending: 'ascending',
  descending: 'descending',
  none: 'none'
} as const

const sortIconByDirection = {
  ascending: 'arrow_upward',
  descending: 'arrow_downward',
  none: 'unfold_more'
} as const

const nextSortDirection = (direction: SortDirection) =>
  direction === 'ascending' ? 'descending' : 'ascending'

type TableHeadContentProps = {
  column: ColumnDefinition
  dragHandleRef?: (element: Element | null) => void
}

/** Presentation only, no drag registration. The element that owns the sortable
 * differs per layout — the `<th>` in the row layout, the whole column container
 * in the column layout — so registration lives in the caller. */
export const TableHeadContent = ({
  column,
  dragHandleRef
}: TableHeadContentProps) => {
  const { onSortChange } = useTableContext()
  const draggingColumnId = useDraggingColumnId()
  const reorderable = column.reorderable !== false
  const direction = column.sortDirection ?? 'none'
  const slots = table()

  const dragHandle = reorderable ? (
    <button
      aria-label={`Reordenar coluna ${column.header}`}
      className="focus-visible:ring-neutral-999 cursor-grab outline-none focus-visible:ring-2"
      ref={dragHandleRef}
      type="button"
    >
      <Icon name="drag_indicator" size="small" />
    </button>
  ) : undefined

  const label = column.sortable ? (
    <button
      className={slots.sortButton()}
      onClick={() => onSortChange?.(column.id, nextSortDirection(direction))}
      type="button"
    >
      {column.header}
      <Icon
        className="text-current"
        name={sortIconByDirection[direction]}
        size="small"
      />
    </button>
  ) : (
    column.header
  )

  return (
    <Cell
      className={columnAlign({
        align: column.align,
        className: draggingColumnId === column.id ? 'opacity-40' : undefined
      })}
      heading
      iconLeft={dragHandle}
      iconRight={column.headerIconRight}
      label={label}
      type="default"
    />
  )
}

type TableHeadProps = {
  column: ColumnDefinition
  /** Supplied by the column layout, where the column container owns the
   * sortable. When present this header registers no sortable of its own. */
  dragHandleRef?: (element: Element | null) => void
  index: number
}

export const TableHead = ({ column, dragHandleRef, index }: TableHeadProps) => {
  const { layout } = useTableContext()
  const reorderable = column.reorderable !== false
  const ownsSortable = dragHandleRef === undefined
  const sortable = useColumnSortable(
    column.id,
    index,
    !reorderable || !ownsSortable
  )

  const sharedProps = {
    'aria-sort': column.sortable
      ? ariaSortByDirection[column.sortDirection ?? 'none']
      : undefined,
    className: columnAlign({ align: column.align }) || undefined
  }

  const content = (
    <TableHeadContent
      column={column}
      dragHandleRef={dragHandleRef ?? sortable.handleRef}
    />
  )

  // No table role in the column layout: a column-major DOM has no row element
  // to contain header/cell roles, and inventing them would emit invalid ARIA.
  // See the FR-022 note in the feature's plan.
  if (layout === 'column') {
    return <div {...sharedProps}>{content}</div>
  }

  return (
    <th ref={sortable.ref} scope="col" {...sharedProps}>
      {content}
    </th>
  )
}
