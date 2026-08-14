import {
  cloneElement,
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactElement
} from 'react'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'
import { BUTTON_ICON_COLOR, buttonBase, SMALL_HIT_AREA } from '../Button'
import { IconProps } from '../Icon'

const iconButton = tv({
  extend: buttonBase,
  variants: {
    size: {
      large: 'size-14 p-3.5 rounded-2xl',
      medium: 'size-12 p-3 rounded-xl',
      small: ['size-8 p-2 rounded-lg', SMALL_HIT_AREA]
    }
  },
  defaultVariants: { size: 'medium' }
})

export type IconButtonProps = Omit<
  ComponentProps<'button'>,
  'children' | 'aria-label'
> &
  VariantProps<typeof iconButton> & {
    children: ReactElement<IconProps>
    'aria-label': string
  }

export const IconButton = forwardRef<ElementRef<'button'>, IconButtonProps>(
  (
    { children, className, color, size, type = 'button', variant, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={iconButton({ className, color, size, variant })}
        type={type}
        {...props}
      >
        {cloneElement(children, {
          className: twMerge(BUTTON_ICON_COLOR, children.props.className),
          size
        })}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'
