import { ComponentProps } from 'react'
import { twMerge } from '@church/ui/lib/tailwind-merge'

export type CountBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  count: number
  /** Above it the badge shows `${max}+`. */
  max?: number
  /** Replaces the default `${count} novos` read by assistive technology. */
  label?: string
}

// why: a generic `<span>` cannot carry a reliable `aria-label`, so the name
// is visually hidden text and the visible digits are hidden from AT.
export const CountBadge = ({
  className,
  count,
  label,
  max = 99,
  ...props
}: CountBadgeProps) => (
  <span
    {...props}
    className={twMerge(
      'inline-flex h-4.5 min-w-6 items-center justify-center rounded-sm px-1 py-px',
      'bg-danger-solid text-size-25 text-on-danger font-medium',
      className
    )}
  >
    <span aria-hidden>{count > max ? `${max}+` : String(count)}</span>
    <span className="sr-only">{label ?? `${count} novos`}</span>
  </span>
)
