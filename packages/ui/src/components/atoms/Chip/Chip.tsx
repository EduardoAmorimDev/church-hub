import { ComponentWithIconProps } from '../Icon'
import { getClonedResizedIcons } from '@church/ui/utils'
import { tv } from '@church/ui/lib/tailwind-variants'

// why: the `::after` box adds 6px above and below, so the 32px chip keeps a
// 44px hit area without growing.
export const chip = tv({
  base: [
    'relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1',
    'border border-default bg-surface font-medium whitespace-nowrap text-primary',
    'transition-[background-color,border-color] duration-150 ease-out',
    'after:absolute after:inset-x-0 after:-inset-y-1.5',
    'not-disabled:hover:bg-hover not-disabled:active:bg-hover disabled:text-disabled'
  ],
  variants: {
    highlighted: {
      true: 'border-neutral-999 bg-hover'
    },
    // invariant: `small` is the 28px Tab of the Backoffice header (141-4446).
    size: {
      medium: 'h-8 text-size-75',
      small: 'h-7 text-size-25'
    }
  },
  defaultVariants: { size: 'medium' }
})

export type ChipProps = ComponentWithIconProps<'button'> & {
  /** invariant: defined ⇒ the chip is a toggle and exposes `aria-pressed`. */
  selected?: boolean
  /** Visual Active state, without toggle semantics. */
  active?: boolean
}

export const Chip = ({
  active,
  children,
  className,
  disabled,
  endIcon,
  selected,
  startIcon,
  type = 'button',
  ...props
}: ChipProps) => {
  const [start, end] = getClonedResizedIcons({
    className: 'text-current',
    disabled,
    icons: [startIcon, endIcon],
    size: 'small'
  })

  return (
    <button
      {...props}
      aria-pressed={selected}
      className={chip({ className, highlighted: Boolean(selected || active) })}
      disabled={disabled}
      type={type}
    >
      {start}
      <span>{children}</span>
      {end}
    </button>
  )
}
