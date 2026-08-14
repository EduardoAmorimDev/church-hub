'use client'

import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactNode,
  useState
} from 'react'
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions
} from 'react-hook-form'
import { Field, FieldProps } from '../Field'
import { Icon } from '../Icon'
import { HelperText, Label } from '../TextField/components'
import { mergeRefs } from '~/components/utils'
import { twMerge } from '~/lib/tailwind-merge'
import { tv } from '~/lib/tailwind-variants'

export type SearchFieldProps = Omit<FieldProps, 'slotProps'> & {
  // Loosely typed on purpose: TextField is a generic, form-agnostic atom, so
  // it accepts a `Control` from any `useForm<T>()` shape rather than forcing
  // callers to align with a specific `FieldValues` type.
  control?: Control<any>
  helperText?: ReactNode
  label?: ReactNode
  name?: string
  rules?: RegisterOptions<FieldValues>
  slotProps?: FieldProps['slotProps'] & {
    clearButton?: ComponentProps<'button'>
    helperText?: ComponentProps<'span'>
    label?: ComponentProps<'label'>
    wrapper?: ComponentProps<'div'>
  }
}

const clearButton = tv({
  variants: {
    size: {
      small: 'text-[16px]',
      medium: 'text-[20px]',
      large: 'text-[24px]'
    }
  },
  defaultVariants: { size: 'medium' }
})

export const SearchField = forwardRef<ElementRef<'input'>, SearchFieldProps>(
  (
    {
      control,
      defaultValue,
      helperText,
      label,
      name,
      rules,
      slotProps,
      startAdornment,
      state,
      ...props
    },
    ref
  ) => {
    // Always declared so the hook order is stable across renders; only the
    // unbound branch reads it (a `name`-driven branch is fully controlled).
    const [inputValue, setInputValue] = useState(defaultValue ?? '')

    if (!name) {
      // Not form-bound: keep the value local so the clear affordance can be
      // gated on a non-empty value (FR-003) without requiring a form wrapper.
      // When `value` is passed explicitly the caller stays in control.
      const isControlled = 'value' in props
      const visibleValue = (isControlled ? props.value : inputValue) ?? ''
      const hasValue = String(visibleValue).length > 0

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            'flex flex-col gap-1.5',
            slotProps?.wrapper?.className
          )}
        >
          {label && <Label {...slotProps?.label}>{label}</Label>}
          <Field
            {...props}
            endAdornment={
              hasValue && !props.disabled ? (
                <button
                  {...slotProps?.clearButton}
                  aria-label="Limpar busca"
                  className={twMerge(
                    clearButton({ size: props.size }),
                    slotProps?.clearButton?.className
                  )}
                  disabled={props.disabled}
                  onClick={() => {
                    if (!isControlled) setInputValue('')
                    props.onChange?.({
                      target: { value: '' },
                      currentTarget: { value: '' }
                    } as ChangeEvent<HTMLInputElement>)
                  }}
                  type="button"
                >
                  <Icon name="close" />
                </button>
              ) : undefined
            }
            onChange={event => {
              if (!isControlled) setInputValue(event.target.value)
              props.onChange?.(event)
            }}
            ref={ref}
            startAdornment={startAdornment ?? <Icon name="search" />}
            state={state}
            value={visibleValue ?? ''}
          />
          {helperText && (
            <HelperText
              {...slotProps?.helperText}
              state={state === 'error' ? 'error' : 'default'}
            >
              {helperText}
            </HelperText>
          )}
        </div>
      )
    }

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { ref: fieldRef, ...field }, fieldState }) => {
          const errorMessage = fieldState.error?.message
          const currentState = fieldState.error ? 'error' : state
          const currentValue = field.value ?? ''

          return (
            <div
              {...slotProps?.wrapper}
              className={twMerge(
                'flex flex-col gap-1.5',
                slotProps?.wrapper?.className
              )}
            >
              {label && (
                <Label {...slotProps?.label} htmlFor={name}>
                  {label}
                </Label>
              )}
              <Field
                {...props}
                {...field}
                endAdornment={
                  currentValue.length > 0 ? (
                    <button
                      {...slotProps?.clearButton}
                      aria-label="Limpar busca campo"
                      className={clearButton({
                        size: props.size,
                        className: slotProps?.clearButton?.className
                      })}
                      disabled={props.disabled}
                      onClick={() => field.onChange('')}
                      type="button"
                    >
                      <Icon name="close" />
                    </button>
                  ) : undefined
                }
                id={name}
                ref={mergeRefs(fieldRef, ref)}
                startAdornment={startAdornment ?? <Icon name="search" />}
                state={currentState}
              />
              {(errorMessage ?? helperText) && (
                <HelperText
                  {...slotProps?.helperText}
                  state={errorMessage ? 'error' : 'default'}
                >
                  {errorMessage ?? helperText}
                </HelperText>
              )}
            </div>
          )
        }}
      />
    )
  }
)
SearchField.displayName = 'SearchField'
