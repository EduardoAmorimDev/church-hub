import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { tv, VariantProps } from 'tailwind-variants'
import { Icon } from '../Icon'
import { iconSizes } from './data'

const button = tv({
  base: 'flex items-center font-medium cursor-pointer disabled:cursor-default hover:bg-transparent transition-colors duration-300 hover:border-border-neutral-primary border',
  variants: {
    color: {
      accent:
        'text-text-accent-primary hover:text-text-accent-primary active:border-border-accent-primary',
      positive:
        'text-text-feedback-positive hover:text-text-feedback-positive active:border-border-feedback-positive',
      neutral:
        'text-text-neutral-primary hover:text-text-neutral-primary active:border-border-neutral-contra',
      negative: 'text-text-feedback-negative hover:text-text-feedback-negative'
    },
    size: {
      small: 'text-xs p-2 rounded-xl h-8 gap-0.5',
      medium: 'text-sm px-4 py-2.5 rounded-1xl h-10 gap-1',
      large: 'text-base px-4 py-3 rounded-2xl h-12 gap-2'
    },
    variant: {
      primary: 'text-text-neutral-contrast',
      secondary: '',
      tertiary: 'bg-transparent'
    }
  },
  compoundVariants: [
    {
      color: 'accent',
      variant: 'primary',
      className: 'bg-background-fill-accent-primary'
    },
    {
      color: 'accent',
      variant: 'secondary',
      className: 'bg-background-fill-accent-quaternary'
    },
    {
      color: 'positive',
      variant: 'primary',
      className: 'bg-background-fill-feedback-positive-primary'
    },
    {
      color: 'positive',
      variant: 'secondary',
      className: 'bg-background-fill-feedback-positive-quaternary'
    },
    {
      color: 'neutral',
      variant: 'primary',
      className: 'bg-background-fill-neutral-solid'
    },
    {
      color: 'neutral',
      variant: 'secondary',
      className: 'bg-background-fill-neutral-primary'
    },
    {
      color: 'negative',
      variant: 'primary',
      className: 'bg-background-fill-feedback-negative-primary'
    },
    {
      color: 'negative',
      variant: 'secondary',
      className: 'bg-background-fill-feedback-negative-quaternary'
    }
  ]
})

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  VariantProps<typeof button>

export const Button = ({
  children,
  className,
  color = 'neutral',
  size = 'medium',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button className={button({ className, color, size, variant })} {...props}>
      <Icon name="13mp" size={iconSizes[size]} />
      {children}
    </button>
  )
}
