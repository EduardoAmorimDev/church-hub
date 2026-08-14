import { ComponentProps } from 'react'
import { twMerge } from '@church/ui/lib/tailwind-merge'

export type SpinnerProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** invariant: set only when nothing else announces the pending state. */
  label?: string
}

// invariant: `size-em` follows the surrounding font size, so the caller
// sizes the ring with a `text-*` class; `data-spinner` is the hook
// `styles.css` slows under reduced motion.
export const Spinner = ({ className, label, ...props }: SpinnerProps) => (
  <span
    {...props}
    {...(label
      ? { 'aria-label': label, role: 'status' }
      : { 'aria-hidden': true })}
    className={twMerge(
      'size-em animate-spinner inline-block shrink-0 rounded-full',
      'border-2 border-current border-r-transparent',
      className
    )}
    data-spinner=""
  />
)
