'use client'

import {
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactElement,
  ReactNode,
  RefAttributes,
  useId
} from 'react'
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions
} from 'react-hook-form'
import { Field, FieldProps } from '../Field'
import { HelperText, Label } from './components'
import { mergeRefs } from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'

export type TextFieldProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<FieldProps, 'slotProps'> & {
    // `TFieldValues` defaults to the base `FieldValues` shape so TextField
    // stays usable without a form (or without stating a schema), but a
    // caller passing a `Control<MySchema>`/`RegisterOptions<MySchema>` gets
    // that schema inferred through end-to-end, with no cast on their side.
    control?: Control<TFieldValues>
    helperText?: ReactNode
    label?: ReactNode
    name?: string
    /**
     * Whether the field is optional. Defaults to `false` (required) since most
     * fields in the product are required — pass `true` to render the
     * "(Opcional)" note instead of the required asterisk.
     */
    optional?: boolean
    rules?: RegisterOptions<TFieldValues>
    slotProps?: {
      helperText?: ComponentProps<'span'>
      label?: ComponentProps<'label'>
      wrapper?: ComponentProps<'div'>
    }
    /**
     * Tooltip text shown next to the label, on an info icon button rendered
     * alongside it.
     */
    tooltip?: string
  }

const helperState = (state?: FieldProps['state']) =>
  state === 'error' ? 'error' : 'default'

const TextFieldInner = forwardRef<ElementRef<'input'>, TextFieldProps>(
  (
    {
      control,
      // Pulled out of the rest spread (rather than left inside `...props`)
      // so they can also be forwarded to `Label`, which sizes/colors itself
      // off the same `disabled`/`size` values as `Field`.
      disabled,
      helperText,
      label,
      name,
      optional = false,
      rules,
      size,
      slotProps,
      state,
      tooltip,
      ...props
    },
    ref
  ) => {
    const generatedFieldId = useId()
    const generatedHelperTextId = useId()
    const helperTextId = slotProps?.helperText?.id ?? generatedHelperTextId

    if (!name) {
      // No `name` here means there's no natural id to key the label/input
      // association on (the `Controller` branch below uses `name` for that),
      // so a generated one is used instead — without it, `Label` has no
      // `htmlFor` to point anywhere and clicking it never focuses the input.
      const fieldId = props.id ?? generatedFieldId

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            'flex flex-col gap-1.5',
            slotProps?.wrapper?.className
          )}
        >
          {label && (
            <Label
              {...slotProps?.label}
              disabled={disabled}
              htmlFor={fieldId}
              optional={optional}
              size={size}
              tooltip={tooltip}
            >
              {label}
            </Label>
          )}
          <Field
            ref={ref}
            aria-describedby={helperText ? helperTextId : undefined}
            disabled={disabled}
            size={size}
            state={state}
            {...props}
            id={fieldId}
          />
          {helperText && (
            <HelperText
              {...slotProps?.helperText}
              id={helperTextId}
              state={helperState(state)}
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
          const hasHelperText = Boolean(errorMessage ?? helperText)

          return (
            <div
              {...slotProps?.wrapper}
              className={twMerge(
                'flex flex-col gap-1.5',
                slotProps?.wrapper?.className
              )}
            >
              {label && (
                <Label
                  {...slotProps?.label}
                  disabled={disabled}
                  htmlFor={name}
                  optional={optional}
                  size={size}
                  tooltip={tooltip}
                >
                  {label}
                </Label>
              )}
              <Field
                aria-describedby={hasHelperText ? helperTextId : undefined}
                disabled={disabled}
                size={size}
                {...props}
                {...field}
                id={name}
                ref={mergeRefs(fieldRef, ref)}
                state={currentState}
              />
              {hasHelperText && (
                <HelperText
                  {...slotProps?.helperText}
                  id={helperTextId}
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
TextFieldInner.displayName = 'TextField'

// `forwardRef` erases the render function's own generics, so the exotic
// component it returns is cast back to a generic call signature here. This
// is a type-only cast (the rendered component is unchanged) that lets
// callers bind `TextField` to their form's real field-values type end to
// end — see `TextFieldProps` above — instead of the component internally
// accepting `Control<any>`/`RegisterOptions<any>`.
export const TextField = TextFieldInner as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: TextFieldProps<TFieldValues> & RefAttributes<ElementRef<'input'>>
) => ReactElement | null
