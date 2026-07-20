import { cloneElement, ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { tv, VariantProps } from 'tailwind-variants'
import { IconProps } from '../Icon'

export const button = tv({
  base: 'flex items-center justify-center gap-2 transition-colors',
  variants: {
    iconOnly: {
      true: ''
    },
    color: {
      destructive: 'text-red-67 not-disabled:hover:text-red-83',
      neutral: 'text-neutral-83 not-disabled:hover:text-neutral-100',
      positive: 'text-green-67 not-disabled:hover:text-green-83'
    },
    size: {
      large: 'px-5 py-3.5 rounded-2xl text-size-100!',
      medium: 'px-4 py-3 rounded-xl text-size-75!',
      small: 'px-3 py-2 rounded-lg text-size-50!'
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
      iconOnly: true,
      size: 'large',
      class: 'p-4'
    },
    {
      iconOnly: true,
      size: 'medium',
      class: 'p-3.5'
    },
    {
      iconOnly: true,
      size: 'small',
      class: 'p-2'
    },
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
    size: 'medium',
    variant: 'filled'
  }
})

export type ButtonProps = ComponentProps<'button'> &
  Omit<VariantProps<typeof button>, 'iconOnly'> & {
    icon?: React.ReactElement<IconProps>
    iconPosition?: 'start' | 'end' | 'both'
  }

export const Button = forwardRef<React.ElementRef<'button'>, ButtonProps>(
  ({ children, className, icon, iconPosition = 'start', ...props }, ref) => {
    const isIconOnly = !!icon && !children

    const startIcon =
      icon && ['start', 'both'].includes(iconPosition)
        ? cloneElement(icon, {
            size: props.size
          })
        : null

    const endIcon =
      icon && ['end', 'both'].includes(iconPosition)
        ? cloneElement(icon, {
            size: props.size
          })
        : null

    return (
      <button
        ref={ref}
        className={twMerge(
          button({ ...props, iconOnly: isIconOnly }),
          className
        )}
        {...props}
      >
        {startIcon}
        {children}
        {endIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
