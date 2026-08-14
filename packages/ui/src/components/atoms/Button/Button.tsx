import { forwardRef } from 'react'
import { ComponentWithIconProps } from '../Icon'
import { Typography } from '../Typography'
import { getClonedResizedIcons } from '@church/ui/utils'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: Lamb paints `:active` like hover and keeps both off a disabled control;
// every hover class below is paired with the same `active:` class.
export const buttonBase = tv({
  base: [
    'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'transition-[background-color] duration-150 ease-out'
  ],
  variants: {
    color: {
      accent: '',
      destructive: '',
      neutral: '',
      positive: ''
    },
    variant: {
      filled: 'disabled:bg-disabled disabled:text-disabled',
      ghost: 'disabled:bg-disabled disabled:text-disabled',
      transparent: 'bg-transparent disabled:text-disabled'
    }
  },
  compoundVariants: [
    {
      variant: 'filled',
      color: 'neutral',
      class: [
        'bg-neutral-999 text-neutral-00',
        'not-disabled:hover:bg-neutral-100 not-disabled:active:bg-neutral-100'
      ]
    },
    {
      variant: 'filled',
      color: 'accent',
      class: [
        'bg-accent-solid text-on-accent',
        'not-disabled:hover:bg-blue-83 not-disabled:active:bg-blue-83'
      ]
    },
    {
      variant: 'filled',
      color: 'positive',
      class: [
        'bg-positive-solid text-on-positive',
        'not-disabled:hover:bg-green-100 not-disabled:active:bg-green-100'
      ]
    },
    {
      variant: 'filled',
      color: 'destructive',
      class: [
        'bg-danger-solid text-on-danger',
        'not-disabled:hover:bg-red-83 not-disabled:active:bg-red-83'
      ]
    },
    {
      variant: 'ghost',
      color: 'neutral',
      class: [
        'bg-neutral-alpha/10 text-primary',
        'not-disabled:hover:bg-neutral-alpha/20 not-disabled:active:bg-neutral-alpha/20'
      ]
    },
    {
      variant: 'ghost',
      color: 'accent',
      class: [
        'bg-blue-alpha/10 text-blue-83',
        'not-disabled:hover:bg-blue-alpha/20 not-disabled:active:bg-blue-alpha/20'
      ]
    },
    {
      variant: 'ghost',
      color: 'positive',
      class: [
        'bg-green-alpha/10 text-green-83',
        'not-disabled:hover:bg-green-alpha/20 not-disabled:active:bg-green-alpha/20'
      ]
    },
    {
      variant: 'ghost',
      color: 'destructive',
      class: [
        'bg-red-alpha/10 text-red-83',
        'not-disabled:hover:bg-red-alpha/20 not-disabled:active:bg-red-alpha/20'
      ]
    },
    {
      variant: 'transparent',
      color: 'neutral',
      class: [
        'text-primary',
        'not-disabled:hover:bg-neutral-alpha/10 not-disabled:active:bg-neutral-alpha/10'
      ]
    },
    {
      variant: 'transparent',
      color: 'accent',
      class: [
        'text-blue-83',
        'not-disabled:hover:bg-blue-alpha/10 not-disabled:active:bg-blue-alpha/10'
      ]
    },
    {
      variant: 'transparent',
      color: 'positive',
      class: [
        'text-green-83',
        'not-disabled:hover:bg-green-alpha/10 not-disabled:active:bg-green-alpha/10'
      ]
    },
    {
      variant: 'transparent',
      color: 'destructive',
      class: [
        'text-red-83',
        'not-disabled:hover:bg-red-alpha/10 not-disabled:active:bg-red-alpha/10'
      ]
    }
  ],
  defaultVariants: {
    color: 'neutral',
    variant: 'filled'
  }
})

// why: Lamb's small controls keep a 44px touch target; the pseudo-element
// grows the hit area 6px above and below without changing the 32px box.
export const SMALL_HIT_AREA =
  'after:absolute after:inset-x-0 after:-inset-y-1.5'

// invariant: icons follow the control's text colour, as Lamb's currentColor.
export const BUTTON_ICON_COLOR = 'text-current'

const button = tv({
  extend: buttonBase,
  variants: {
    size: {
      large: 'h-14 px-5 py-3.5 rounded-2xl',
      medium: 'h-12 px-4 py-3 rounded-xl',
      small: ['h-8 px-3 py-2 rounded-lg', SMALL_HIT_AREA]
    }
  },
  defaultVariants: { size: 'medium' }
})

export type ButtonProps = ComponentWithIconProps<'button'> &
  VariantProps<typeof button>

const typographyVariantBySize = {
  large: 'f1',
  medium: 'f2',
  small: 'f3'
} as const

export const Button = forwardRef<React.ElementRef<'button'>, ButtonProps>(
  (
    {
      children,
      className,
      color,
      endIcon,
      size = 'medium',
      startIcon,
      type = 'button',
      variant,
      ...props
    },
    ref
  ) => {
    const [clonedStartIcon, clonedEndIcon] = getClonedResizedIcons({
      className: BUTTON_ICON_COLOR,
      icons: [startIcon, endIcon],
      size
    })

    return (
      <button
        ref={ref}
        className={button({ className, color, size, variant })}
        type={type}
        {...props}
      >
        {clonedStartIcon}
        {children != null && (
          <Typography as="span" variant={typographyVariantBySize[size]}>
            {children}
          </Typography>
        )}
        {clonedEndIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
