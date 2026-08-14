import { buttonBase } from '@church/ui/atoms/Button'
import { fieldControl } from '@church/ui/utils'
import { tv } from '@church/ui/lib/tailwind-variants'

export const paginator = tv({
  slots: {
    root: [
      'flex flex-wrap items-center justify-between gap-6 p-2',
      'font-normal text-secondary text-size-25'
    ],
    start: 'flex items-center gap-2',
    end: 'flex items-center gap-4',
    controls: 'flex items-center gap-2',
    cluster: 'flex items-center gap-1',
    supportingText: 'whitespace-nowrap text-secondary',
    // why: Lamb clears the fill of a disabled navigation button instead of
    // the ghost button's `bg-disabled`.
    navButton: 'disabled:bg-transparent',
    navIcon: 'text-icon-18!',
    selectBox: [
      fieldControl(),
      'relative flex h-8 w-17 items-center rounded-lg'
    ],
    select: [
      'h-full w-full cursor-pointer appearance-none rounded-lg bg-transparent',
      'pr-8 pl-2 font-sans text-primary text-size-50 outline-none'
    ],
    selectIcon: 'pointer-events-none absolute right-2 text-secondary',
    jumpField: 'w-17 *:min-w-0'
  }
})

export const pageButton = tv({
  extend: buttonBase,
  base: 'h-8 min-w-8 rounded-lg px-2 py-0 text-primary',
  variants: {
    current: {
      false: '',
      true: 'inset-ring inset-ring-neutral-999'
    }
  },
  defaultVariants: {
    color: 'neutral',
    current: false,
    variant: 'transparent'
  }
})
