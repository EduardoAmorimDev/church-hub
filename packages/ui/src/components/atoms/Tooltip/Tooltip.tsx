'use client'

import {
  cloneElement,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  useId,
  useState
} from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const tooltip = tv({
  slots: {
    wrapper: 'relative inline-flex',
    panel: [
      'pointer-events-none absolute z-50 w-max max-w-60 rounded-lg bg-neutral-999',
      'px-3 py-2 text-size-50 font-medium text-neutral-00',
      'opacity-0 transition-opacity data-[open=true]:opacity-100'
    ],
    arrow: 'absolute size-2 rotate-45 bg-neutral-999'
  },
  variants: {
    placement: {
      top: {
        panel: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
        arrow: 'bottom-[-4px] left-1/2 -translate-x-1/2'
      },
      bottom: {
        panel: 'top-full left-1/2 mt-2 -translate-x-1/2',
        arrow: 'top-[-4px] left-1/2 -translate-x-1/2'
      },
      left: {
        panel: 'right-full top-1/2 mr-2 -translate-y-1/2',
        arrow: 'right-[-4px] top-1/2 -translate-y-1/2'
      },
      right: {
        panel: 'left-full top-1/2 ml-2 -translate-y-1/2',
        arrow: 'left-[-4px] top-1/2 -translate-y-1/2'
      }
    }
  },
  defaultVariants: {
    placement: 'top'
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
  placement
}: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  const slots = tooltip({ placement })

  if (!content) return children

  const show = () => !disabled && setOpen(true)
  const hide = () => setOpen(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') hide()
  }

  const describedBy = [children.props['aria-describedby'], id]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={slots.wrapper()}
      onBlur={hide}
      onFocus={show}
      onKeyDown={handleKeyDown}
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
        <span className={slots.arrow()} />
      </span>
    </span>
  )
}
