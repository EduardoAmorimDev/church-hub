import { buttonBase } from '@church/ui/atoms/Button'
import { fieldDefaultRing } from '@church/ui/utils'
import { tv } from '@church/ui/lib/tailwind-variants'

export const paginator = tv({
  slots: {
    root: 'flex items-center justify-between gap-4 p-2',
    start: 'flex items-center gap-2',
    end: 'flex items-center gap-4',
    controls: 'flex items-center gap-2',
    cluster: 'flex items-center gap-1',
    supportingText: 'whitespace-nowrap text-neutral-67',
    selectBox: [
      'relative flex h-8 w-17 items-center rounded-lg bg-neutral-00',
      fieldDefaultRing('select'),
      'transition-[box-shadow]'
    ],
    select: [
      'h-full w-full cursor-pointer appearance-none rounded-lg bg-transparent',
      'pr-8 pl-3 font-sans text-size-50 text-neutral-67 outline-none'
    ],
    selectIcon: 'pointer-events-none absolute right-3 text-neutral-67',
    jumpField: 'w-17 bg-neutral-00 *:min-w-0'
  }
})

export const pageButton = tv({
  extend: buttonBase,
  base: 'min-w-8 rounded-lg px-1.5 py-2',
  variants: {
    current: {
      false: '',
      true: 'inset-ring inset-ring-neutral-999'
    }
  },
  // why: a compound variant merges after `color`, so the current page's
  // neutral-100 wins over the neutral-83 that `buttonBase` sets.
  compoundVariants: [
    { color: 'neutral', current: true, class: 'text-neutral-100' }
  ],
  defaultVariants: {
    color: 'neutral',
    current: false,
    variant: 'transparent'
  }
})
