'use client'

import {
  ChangeEvent,
  ComponentProps,
  ReactNode,
  useId,
  useMemo,
  useState
} from 'react'
import { OPTIONS_GAP } from './data'
import {
  RadioGroupContext,
  RadioGroupContextValue,
  RadioSize
} from '@church/ui/atoms/Radio'
import { FieldHelperText } from '@church/ui/atoms/TextField/components'
import { tv } from '@church/ui/lib/tailwind-variants'

const radioGroup = tv({
  slots: {
    root: 'm-0 flex min-w-0 flex-col gap-2 border-0 p-0',
    legend: 'mb-1 p-0 text-size-75 font-medium text-primary',
    required: 'text-danger',
    optional: 'ml-2 text-size-50 font-normal text-secondary',
    helper: '-mt-1',
    options: 'flex'
  },
  variants: {
    variant: {
      default: { options: OPTIONS_GAP.default },
      card: { options: OPTIONS_GAP.card }
    },
    orientation: {
      vertical: { options: 'flex-col' },
      horizontal: { options: 'flex-row flex-wrap' }
    },
    legendHidden: {
      true: { legend: 'sr-only' }
    }
  },
  compoundVariants: [
    {
      variant: 'default',
      orientation: 'horizontal',
      class: { options: 'gap-x-6' }
    },
    {
      variant: 'card',
      orientation: 'horizontal',
      class: { options: 'grid grid-cols-fill-50' }
    }
  ],
  defaultVariants: { orientation: 'vertical', variant: 'default' }
})

export type RadioGroupProps = Omit<
  ComponentProps<'fieldset'>,
  'children' | 'defaultValue' | 'onChange' | 'role'
> & {
  value?: string | null
  defaultValue?: string
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void
  /** why: Lamb allows horizontal only for up to 3 short options. */
  orientation?: 'vertical' | 'horizontal'
  legend?: ReactNode
  /** invariant: hides the legend visually; it still names the group. */
  legendHidden?: boolean
  helperText?: ReactNode
  error?: ReactNode
  /** invariant: required by default, like the TextField: `true` drops the
   * asterisk and `aria-required` and shows "(Opcional)". */
  optional?: boolean
  size?: RadioSize
  variant?: 'default' | 'card'
  disabled?: boolean
  name?: string
  children: ReactNode
}

export const RadioGroup = ({
  children,
  className,
  defaultValue,
  disabled = false,
  error,
  helperText,
  legend,
  legendHidden = false,
  name,
  onChange,
  optional = false,
  orientation = 'vertical',
  size = 'medium',
  value,
  variant = 'default',
  ...props
}: RadioGroupProps) => {
  const generatedId = useId()
  const legendId = `${generatedId}-legend`
  const helperId = `${generatedId}-helper`
  const errorId = `${generatedId}-error`
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    defaultValue ?? null
  )
  const current = value !== undefined ? value : uncontrolledValue
  const hasLegend = legend != null && legend !== false
  const hasHelper = helperText != null && helperText !== false
  const hasError = error != null && error !== false && error !== ''
  const slots = radioGroup({ legendHidden, orientation, variant })
  const describedBy =
    [hasHelper ? helperId : undefined, hasError ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  const context = useMemo<RadioGroupContextValue>(
    () => ({
      disabled,
      invalid: hasError,
      name: name ?? `radio-group-${generatedId}`,
      select: (next, event) => {
        if (value === undefined) setUncontrolledValue(next)
        onChange?.(next, event)
      },
      size,
      value: current,
      variant
    }),
    [
      current,
      disabled,
      generatedId,
      hasError,
      name,
      onChange,
      size,
      value,
      variant
    ]
  )

  return (
    <fieldset
      {...props}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      aria-labelledby={hasLegend ? legendId : undefined}
      aria-required={optional ? undefined : true}
      className={slots.root({ className })}
      disabled={disabled}
      role="radiogroup"
    >
      {hasLegend && (
        <legend className={slots.legend()} id={legendId}>
          {legend}
          {!optional && (
            <span aria-hidden="true" className={slots.required()}>
              {' *'}
            </span>
          )}
          {optional && <span className={slots.optional()}>(Opcional)</span>}
        </legend>
      )}
      {hasHelper && (
        <FieldHelperText className={slots.helper()} id={helperId}>
          {helperText}
        </FieldHelperText>
      )}
      <div className={slots.options()}>
        <RadioGroupContext.Provider value={context}>
          {children}
        </RadioGroupContext.Provider>
      </div>
      {hasError && (
        <FieldHelperText id={errorId} state="error">
          {error}
        </FieldHelperText>
      )}
    </fieldset>
  )
}
