import { ComponentProps } from 'react'
import { FieldProps } from '../../Field'
import { Icon } from '../../Icon'
import { Tooltip } from '../../Tooltip'
import { tv } from '@church/ui/lib/tailwind-variants'

const labelText = tv({
  base: 'font-normal text-primary',
  variants: {
    size: {
      small: 'text-size-25',
      medium: 'text-size-75',
      large: 'text-size-75'
    }
  },
  defaultVariants: { size: 'medium' }
})

export type LabelProps = ComponentProps<'label'> & {
  /** invariant: omitted renders a bare `<label>`; `false` adds the required
   * `*`, `true` adds "(Opcional)". */
  optional?: boolean
  size?: FieldProps['size']
  tooltip?: string
}

export const Label = ({
  children,
  className,
  optional,
  size,
  tooltip,
  ...props
}: LabelProps) => {
  const isRequired = optional === false
  const isOptional = optional === true
  const label = (
    <label {...props} className={labelText({ className, size })}>
      {children}
    </label>
  )

  if (!isRequired && !isOptional && !tooltip) {
    return label
  }

  // invariant: the asterisk is a sibling of the label, hidden from assistive
  // tech; the input's `aria-required` carries the requirement instead.
  return (
    <div className="flex items-center gap-1">
      {label}
      {isRequired && (
        <span
          aria-hidden="true"
          className={labelText({ className: 'text-danger', size })}
        >
          {'*'}
        </span>
      )}
      {tooltip && (
        <Tooltip content={tooltip}>
          <Icon className="text-secondary" fill={1} name="info" size="small" />
        </Tooltip>
      )}
      {isOptional && (
        <span className="text-size-50 text-secondary ml-auto">(Opcional)</span>
      )}
    </div>
  )
}
