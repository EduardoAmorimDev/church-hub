import { cloneElement, ComponentProps, forwardRef, ReactElement } from 'react'
import { tv, VariantProps } from '~/lib/tailwind-variants'
import { twMerge } from '~/lib/tailwind-merge'
import { IconProps } from '../Icon'
import { buttonBase } from '../Button'

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

export const IconButton = forwardRef<
  React.ElementRef<'button'>,
  IconButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={twMerge(iconButton(props), className)}
      {...props}
    >
      {cloneElement(children, { size: props.size })}
    </button>
  )
})
IconButton.displayName = 'Button'
