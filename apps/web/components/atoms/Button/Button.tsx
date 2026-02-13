import { isValidElement } from 'react'
import { tv, VariantProps } from 'tailwind-variants'
import { Icon } from '../Icon'
import { BaseButtonProps } from './Button.types'
import { iconSizes } from './data'
import { renderButtonChildren } from './utils'

const button = tv({
  base: [
    'flex items-center font-medium',
    'transition-colors duration-300',
    'border border-transparent',

    'enabled:cursor-pointer',
    'enabled:hover:border-border-neutral-primary',
    'enabled:hover:bg-transparent',

    'disabled:cursor-default'
  ],
  variants: {
    color: {
      accent: [
        'text-text-accent-primary',
        'enabled:hover:text-text-accent-primary',
        'enabled:active:border-border-accent-primary'
      ],
      positive: [
        'text-text-feedback-positive',
        'enabled:hover:text-text-feedback-positive',
        'enabled:active:border-border-feedback-positive'
      ],
      neutral: [
        'text-text-neutral-primary',
        'enabled:hover:text-text-neutral-primary',
        'enabled:active:border-border-neutral-contrast'
      ],
      negative: [
        'text-text-feedback-negative',
        'enabled:hover:text-text-feedback-negative',
        'enabled:active:border-border-feedback-negative'
      ]
    },
    iconOnly: {
      true: '',
      false: ''
    },
    size: {
      small: 'text-xs p-2 rounded-xl h-8 gap-0.5 ',
      medium: 'text-sm px-4 py-2.5 rounded-1xl h-10 gap-1 ',
      large: 'text-base px-4 py-3 rounded-2xl h-12 gap-2 '
    },
    variant: {
      primary: [
        'text-text-neutral-contrast',
        'disabled:bg-background-fill-neutral-secondary'
      ],
      secondary: [
        'border-transparent',
        'disabled:text-text-neutral-contrast',
        'disabled:bg-background-fill-neutral-secondary'
      ],
      tertiary: [
        'bg-transparent border-transparent',
        'disabled:text-text-neutral-quaternary'
      ]
    }
  },
  defaultVariants: {
    color: 'neutral',
    size: 'medium',
    variant: 'primary'
  },
  compoundVariants: [
    {
      color: 'accent',
      variant: 'primary',
      className: 'bg-background-fill-accent-primary'
    },
    {
      color: 'positive',
      variant: 'primary',
      className: 'bg-background-fill-feedback-positive-primary'
    },
    {
      color: 'neutral',
      variant: 'primary',
      className: 'bg-background-fill-neutral-solid'
    },
    {
      color: 'negative',
      variant: 'primary',
      className: 'bg-background-fill-feedback-negative-primary'
    },
    {
      color: 'accent',
      variant: 'secondary',
      className: 'bg-background-fill-accent-quaternary'
    },
    {
      color: 'positive',
      variant: 'secondary',
      className: 'bg-background-fill-feedback-positive-quaternary'
    },
    {
      color: 'neutral',
      variant: 'secondary',
      className: 'bg-background-fill-neutral-primary'
    },
    {
      color: 'negative',
      variant: 'secondary',
      className: 'bg-background-fill-feedback-negative-quaternary'
    },
    {
      size: 'small',
      iconOnly: true,
      className: 'p-2'
    },
    {
      size: 'medium',
      iconOnly: true,
      className: 'p-2.5'
    },
    {
      size: 'large',
      iconOnly: true,
      className: 'p-3'
    }
  ]
})

export type ButtonProps = BaseButtonProps &
  Omit<VariantProps<typeof button>, 'iconOnly'>

export const Button = ({
  children,
  className,
  color,
  size = 'medium',
  variant,
  ...props
}: ButtonProps) => {
  const iconOnly = isValidElement(children) && children.type === Icon

  return (
    <button
      className={button({ className, color, size, variant, iconOnly })}
      {...props}
    >
      {renderButtonChildren(children, iconSizes[size])}
    </button>
  )
}
