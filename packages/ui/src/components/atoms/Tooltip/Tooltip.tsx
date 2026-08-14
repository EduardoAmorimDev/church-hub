'use client'

import {
  cloneElement,
  ReactElement,
  ReactNode,
  useEffect,
  useId,
  useState
} from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: `visibility` transitions with the opacity so the 120ms fade also
// plays on close before the panel leaves the accessibility tree.
const tooltip = tv({
  slots: {
    wrapper: 'relative inline-flex',
    panel: [
      'pointer-events-none absolute z-50 w-max whitespace-nowrap rounded-lg',
      'bg-neutral-999 px-2 py-1 font-medium text-inverse shadow-elevation-high-bottom',
      'invisible opacity-0 transition-[opacity,visibility] duration-120 ease-out',
      'data-[open=true]:visible data-[open=true]:opacity-100'
    ]
  },
  variants: {
    placement: {
      top: { panel: 'bottom-full left-1/2 mb-2 -translate-x-1/2' },
      bottom: { panel: 'top-full left-1/2 mt-2 -translate-x-1/2' },
      left: { panel: 'right-full top-1/2 mr-2 -translate-y-1/2' },
      right: { panel: 'left-full top-1/2 ml-2 -translate-y-1/2' }
    },
    size: {
      medium: { panel: 'text-size-50 leading-5' },
      large: { panel: 'text-size-100' }
    }
  },
  defaultVariants: {
    placement: 'top',
    size: 'medium'
  }
})

export type TooltipProps = VariantProps<typeof tooltip> & {
  /** The trigger element the tooltip is anchored to and shown for on hover/focus. */
  children: ReactElement
  /** The tooltip's text content. When omitted, the trigger renders as-is. */
  content?: ReactNode
  /** Disables the tooltip, preventing it from ever being shown. */
  disabled?: boolean
}

export const Tooltip = ({
  children,
  content,
  disabled = false,
  placement,
  size
}: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  const slots = tooltip({ placement, size })

  // why: Lamb closes the tooltip on Esc even when focus is elsewhere (a
  // hover-opened tooltip never had focus), so the listener is document-wide.
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (!content) return children

  const show = () => !disabled && setOpen(true)
  const hide = () => setOpen(false)

  const describedBy = [children.props['aria-describedby'], id]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={slots.wrapper()}
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {cloneElement(children, { 'aria-describedby': describedBy })}
      <span
        className={slots.panel()}
        data-open={open && !disabled}
        id={id}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}
