import { forwardRef } from 'react'
import { ComponentWithIconProps } from '../Icon'
import { getClonedResizedIcons } from '~/components/utils'
import { tv, VariantProps } from '~/lib/tailwind-variants'

export const buttonBase = tv({
  base: 'flex items-center justify-center gap-2 transition-colors',
  variants: {
    color: {
      destructive: 'text-red-67 not-disabled:hover:text-red-83',
      neutral: 'text-neutral-83 not-disabled:hover:text-neutral-100',
      positive: 'text-green-67 not-disabled:hover:text-green-83'
    },
    variant: {
      filled:
        'text-neutral-00 not-disabled:hover:text-neutral-00 disabled:bg-neutral-17 disabled:text-neutral-50',
      ghost:
        'bg-neutral-alpha/10 not-disabled:hover:bg-neutral-alpha/20 disabled:text-neutral-33',
      transparent:
        'bg-transparent not-disabled:hover:bg-neutral-alpha/10 disabled:text-neutral-33'
    }
  },
  compoundVariants: [
    {
      color: 'destructive',
      variant: 'filled',
      class: ['bg-red-67', 'not-disabled:hover:bg-red-83']
    },
    {
      color: 'neutral',
      variant: 'filled',
      class: ['bg-neutral-999', 'not-disabled:hover:bg-neutral-100']
    },
    {
      color: 'positive',
      variant: 'filled',
      class: ['bg-green-67', 'not-disabled:hover:bg-green-83']
    },
    {
      color: 'destructive',
      variant: 'transparent',
      class: ['not-disabled:hover:text-red-67']
    },
    {
      color: 'positive',
      variant: 'transparent',
      class: ['not-disabled:hover:text-green-67']
    }
  ],
  defaultVariants: {
    color: 'neutral',
    variant: 'filled'
  }
})

const button = tv({
  extend: buttonBase,
  variants: {
    size: {
      large: 'px-5 py-3.5 rounded-2xl text-size-100',
      medium: 'px-4 py-3 rounded-xl text-size-75',
      small: 'px-3 py-2 rounded-lg text-size-50'
    }
  },
  defaultVariants: { size: 'medium' }
})

export type ButtonProps = ComponentWithIconProps<'button'> &
  VariantProps<typeof button>

export const Button = forwardRef<React.ElementRef<'button'>, ButtonProps>(
  ({ children, className, color, endIcon, startIcon, ...props }, ref) => {
    const { size } = props
    const [clonedStartIcon, clonedEndIcon] = getClonedResizedIcons({
      icons: [startIcon, endIcon],
      size
    })

    return (
      <button
        ref={ref}
        className={button({ className, color, size })}
        {...props}
      >
        {clonedStartIcon}
        {children}
        {clonedEndIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
