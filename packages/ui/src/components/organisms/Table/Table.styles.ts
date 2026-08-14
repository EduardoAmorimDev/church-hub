import { tv } from '@church/ui/lib/tailwind-variants'

// Row fill and divider are the only two surface tokens the Figma prototype
// binds (neutral-00 and neutral-17). The divider is an inset box-shadow rather
// than a border so it stays out of the box model and cannot alter the 40/48px
// cell heights required by FR-003.
export const rowSurface = tv({
  base: 'bg-neutral-00 shadow-[inset_0_-1px_0_0_var(--color-neutral-17)]',
  variants: {
    // No classes yet: the prototype defines no hover/selected/disabled fill and
    // FR-027 requires design validation before any token is chosen. The
    // variants exist so the treatment has a single place to land, and the
    // matching data-* attributes are already emitted for styling and testing.
    disabled: { true: '' },
    selected: { true: '' }
  }
})

export const table = tv({
  slots: {
    root: 'w-full overflow-x-auto',
    grid: 'w-full border-collapse text-left',
    columnGrid: 'grid w-full grid-flow-col auto-cols-fr',
    column: 'flex flex-col',
    caption: 'sr-only',
    stateMessage:
      'flex items-center justify-center p-8 text-neutral-67 text-size-50'
  }
})
