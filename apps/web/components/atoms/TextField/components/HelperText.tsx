import { ComponentProps } from 'react'
import { tv, VariantProps } from '~/lib/tailwind-variants'

const helperText = tv({
  base: 'text-size-50',
  variants: {
    state: {
      default: 'text-neutral-67',
      error: 'text-red-67'
    }
  },
  defaultVariants: {
    state: 'default'
  }
})

type HelperTextProps = ComponentProps<'span'> & VariantProps<typeof helperText>

export const HelperText = ({ className, state, ...props }: HelperTextProps) => (
  <span className={helperText({ className, state })} {...props}></span>
)
