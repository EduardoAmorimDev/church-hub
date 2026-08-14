import { ComponentProps } from 'react'
import { FieldProps } from '../../Field'
import { Icon } from '../../Icon'
import { Tooltip } from '../../Tooltip'
import { tv } from '@church/ui/lib/tailwind-variants'

const labelVariants = tv({
  slots: {
    root: '',
    // The "(Opcional)" note (and, by extension, the tooltip icon next to
    // it — see `iconColor` below) tracks the label's own size and color
    // rather than a fixed size/shade of its own.
    trailing: 'flex cursor-default items-center gap-1'
  },
  variants: {
    size: {
      small: { root: 'text-size-25', trailing: 'text-size-25' },
      medium: { root: 'text-size-75', trailing: 'text-size-75' },
      large: { root: 'text-size-75', trailing: 'text-size-75' }
    },
    disabled: {
      true: { root: 'text-neutral-67', trailing: 'text-neutral-67' },
      false: { root: 'text-neutral-83', trailing: 'text-neutral-83' }
    }
  },
  defaultVariants: {
    size: 'medium',
    disabled: false
  }
})

// The tooltip icon is rendered through `Tooltip`'s own wrapper element, so
// it can't just be left to inherit `trailing`'s color — it's given the same
// neutral-83/67 explicitly instead.
const iconColor = (disabled?: boolean) =>
  disabled ? 'text-neutral-67' : 'text-neutral-83'

export type LabelProps = ComponentProps<'label'> & {
  /**
   * Whether the associated field is disabled. Dims the label (and the
   * "(Opcional)" note / tooltip icon alongside it) from neutral-83 to
   * neutral-67.
   */
  disabled?: boolean
  /**
   * Whether the associated field is optional. When omitted, the label
   * behaves exactly as a plain `<label>` (used as-is by components that
   * haven't adopted the required/optional row yet). When explicitly set,
   * `false` renders a red required asterisk and `true` renders an
   * "(Opcional)" note on the opposite side of the label.
   */
  optional?: boolean
  /**
   * Size of the associated field, matching `Field`'s `size` variant. Drives
   * the label's font size (text-size-25 for small, text-size-75 for medium
   * and large).
   */
  size?: FieldProps['size']
  /**
   * Tooltip text for the label, shown on an info icon button rendered
   * alongside it.
   */
  tooltip?: string
}

export const Label = ({
  children,
  className,
  disabled,
  optional,
  size,
  tooltip,
  ...props
}: LabelProps) => {
  const isRequired = optional === false
  const isOptional = optional === true
  const hasTrailingContent = isOptional || Boolean(tooltip)
  const slots = labelVariants({ disabled, size })

  const label = (
    <label {...props} className={slots.root({ className })}>
      {children}
      {isRequired && <span className="text-red-67"> *</span>}
    </label>
  )

  if (!isRequired && !hasTrailingContent) {
    return label
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {label}
      {hasTrailingContent && (
        <span className={slots.trailing()}>
          {isOptional && '(Opcional)'}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Icon
                className={iconColor(disabled)}
                color="neutral"
                fill={1}
                name="info"
                size="small"
              />
            </Tooltip>
          )}
        </span>
      )}
    </div>
  )
}
