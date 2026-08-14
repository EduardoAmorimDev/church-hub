import {
  cloneElement,
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactElement
} from 'react'
import { tv, VariantProps } from '~/lib/tailwind-variants'
import { buttonBase } from '../Button'
import { IconProps } from '../Icon'

const iconButton = tv({
  extend: buttonBase,
  variants: {
    size: {
      large: 'p-4 rounded-2xl text-size-100',
      medium: 'p-3.5 rounded-xl text-size-75',
      small: 'p-2 rounded-lg text-size-50'
    }
  },
  defaultVariants: { size: 'medium' }
})

export type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> &
  VariantProps<typeof iconButton> & {
    children: ReactElement<IconProps>
  }

export const IconButton = forwardRef<ElementRef<'button'>, IconButtonProps>(
  ({ children, className, color, size, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={iconButton({ className, color, size, variant })}
        {...props}
      >
        {cloneElement(children, { size })}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'
