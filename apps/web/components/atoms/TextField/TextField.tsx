'use client'

import { ComponentProps, ElementRef, forwardRef, ReactNode } from 'react'
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions
} from 'react-hook-form'
import { Field, FieldProps } from '../Field'
import { HelperText, Label } from './components'
import { mergeRefs } from '~/components/utils'
import { twMerge } from '~/lib/tailwind-merge'

export type TextFieldProps = Omit<FieldProps, 'slotProps'> & {
  // Loosely typed on purpose: TextField is a generic, form-agnostic atom, so
  // it accepts a `Control` from any `useForm<T>()` shape rather than forcing
  // callers to align with a specific `FieldValues` type.
  control?: Control<any>
  helperText?: ReactNode
  label?: ReactNode
  name?: string
  rules?: RegisterOptions<FieldValues>
  slotProps?: FieldProps['slotProps'] & {
    helperText?: ComponentProps<'span'>
    label?: ComponentProps<'label'>
    wrapper?: ComponentProps<'div'>
  }
}

const helperState = (state?: FieldProps['state']) =>
  state === 'error' ? 'error' : 'default'

export const TextField = forwardRef<ElementRef<'input'>, TextFieldProps>(
  (
    { control, helperText, label, name, rules, slotProps, state, ...props },
    ref
  ) => {
    if (!name) {
      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            'flex flex-col gap-1.5',
            slotProps?.wrapper?.className
          )}
        >
          {label && <Label {...slotProps?.label}>{label}</Label>}
          <Field ref={ref} slotProps={slotProps} state={state} {...props} />
          {helperText && (
            <HelperText {...slotProps?.helperText} state={helperState(state)}>
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
                id={name}
                ref={mergeRefs(fieldRef, ref)}
                slotProps={slotProps}
                state={currentState}
              />
              {(errorMessage ?? helperText) && (
                <HelperText
                  {...slotProps?.helperText}
                  state={helperState(currentState)}
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
TextField.displayName = 'TextField'
