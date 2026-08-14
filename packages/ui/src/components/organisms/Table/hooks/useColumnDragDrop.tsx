'use client'

import { ReactNode } from 'react'
import { DragDropProvider, DragOverlay, useDragOperation } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'

// This is the ONLY file in the repository that imports @dnd-kit. The dependency
// is pre-1.0 (research.md R2), so keeping its surface to one module means a
// swap back to the legacy lineage costs one file, not the component.

type ColumnDragDropProviderProps = {
  children: ReactNode
  /** Current column order. The drop handler derives the next order from it. */
  columnIds: ReadonlyArray<string>
  onReorder: (nextIds: string[]) => void
}

export const ColumnDragDropProvider = ({
  children,
  columnIds,
  onReorder
}: ColumnDragDropProviderProps) => (
  <DragDropProvider
    onDragEnd={event => {
      // A cancelled drag must leave the order untouched (FR-025).
      if (event.canceled) return

      // `move` is the library's own reducer: it reads the operation's resolved
      // indices, which is the only reliable source once optimistic sorting has
      // already reordered the DOM. Deriving the order from source/target ids by
      // hand misses that and leaves our state — and the table body — unchanged.
      const next = move([...columnIds], event)

      const unchanged =
        next.length === columnIds.length &&
        next.every((id, index) => id === columnIds[index])

      if (unchanged) return

      onReorder(next)
    }}
  >
    {children}
  </DragDropProvider>
)

type ColumnDragOverlayProps = {
  children: (columnId: string) => ReactNode
}

/** Renders the drag preview. Without it the row layout can only drag the header
 * cell, because a column's cells live in different rows and share no DOM node. */
export const ColumnDragOverlay = ({ children }: ColumnDragOverlayProps) => (
  <DragOverlay>
    {source => (typeof source.id === 'string' ? children(source.id) : null)}
  </DragOverlay>
)

/** Id of the column currently being dragged, so its cells can show that they
 * are the ones moving. */
export const useDraggingColumnId = (): string | undefined => {
  const { source } = useDragOperation()

  return typeof source?.id === 'string' ? source.id : undefined
}

type UseColumnSortableResult = {
  handleRef: (element: Element | null) => void
  isDragging: boolean
  ref: (element: Element | null) => void
}

export const useColumnSortable = (
  id: string,
  index: number,
  disabled: boolean
): UseColumnSortableResult => {
  const { handleRef, isDragging, ref } = useSortable({
    disabled,
    id,
    index,
    type: 'column'
  })

  return { handleRef, isDragging, ref }
}
