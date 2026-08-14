import { tv } from '@church/ui/lib/tailwind-variants'

// Row fill and divider are the only two surface tokens the Figma prototype
// binds (neutral-00 and neutral-17). The divider is an inset box-shadow rather
// than a border so it stays out of the box model and cannot alter the 40/48px
// cell heights required by FR-003.
export const rowSurface = tv({
  base: [
    'bg-neutral-00 shadow-[inset_0_-1px_0_0_var(--color-neutral-17)]',
    'hover:bg-hover'
  ],
  variants: {
    // why: Lamb paints no disabled row; the data-* attribute stays the hook.
    // A selected row keeps its fill under the pointer, as in Lamb.
    disabled: { true: '' },
    selected: { true: 'bg-selected hover:bg-selected' }
  }
})

// invariant: the Cell inside a data cell owns the row height, so density is
// applied to it; dense also trims the vertical padding to 4px (Lamb).
export const densityCell = tv({
  variants: {
    density: {
      default: 'h-12',
      compact: 'h-10',
      dense: 'h-8 py-1'
    }
  },
  defaultVariants: { density: 'default' }
})

export const columnAlign = tv({
  variants: {
    align: {
      left: '',
      right: 'justify-end text-right tabular-nums'
    }
  },
  defaultVariants: { align: 'left' }
})

export const table = tv({
  slots: {
    root: 'w-full overflow-x-auto',
    grid: 'w-full border-collapse text-left',
    columnGrid: 'grid w-full grid-flow-col auto-cols-fr',
    column: 'flex flex-col',
    headerRow: 'border-b border-default bg-surface',
    caption: 'pb-2 text-left font-medium text-secondary text-size-50',
    selectionColumn: 'w-10',
    sortButton: 'inline-flex cursor-pointer items-center gap-1 rounded-sm',
    stateMessage:
      'flex items-center justify-center px-4 py-10 text-secondary text-size-50'
  },
  variants: {
    captionHidden: {
      true: { caption: 'sr-only' }
    }
  }
})
