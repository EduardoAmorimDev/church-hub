import { ComponentProps } from 'react'
import { FieldProps } from '../../Field'
import { Icon } from '../../Icon'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const fieldHelperText = tv({
  base: 'm-0 flex items-start gap-1 font-normal',
  variants: {
    size: {
      small: 'text-size-25',
      medium: 'text-size-50 leading-5',
      large: 'text-size-50 leading-5'
    },
    state: {
      default: 'text-secondary',
      error: 'text-danger',
      success: 'text-positive'
    }
  },
  defaultVariants: {
    size: 'medium',
    state: 'default'
  }
})

const STATE_ICON = {
  default: undefined,
  error: 'error',
  success: 'check_circle'
} as const

export type FieldHelperTextProps = ComponentProps<'p'> &
  VariantProps<typeof fieldHelperText> & {
    size?: FieldProps['size']
  }

export const FieldHelperText = ({
  children,
  className,
  size,
  state = 'default',
  ...props
}: FieldHelperTextProps) => {
  const iconName = STATE_ICON[state]

  return (
    <p {...props} className={fieldHelperText({ className, size, state })}>
      {iconName && (
        <Icon className="text-current" fill={1} name={iconName} size="small" />
      )}
      <span>{children}</span>
    </p>
  )
}
