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
import { FieldHelperText, Label } from './components'
import { fieldWrapper, mergeRefs } from '@church/ui/utils'
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
      helperText?: ComponentProps<'p'>
      label?: ComponentProps<'label'>
      wrapper?: ComponentProps<'div'>
    }
    /**
     * Tooltip text shown next to the label, on an info icon button rendered
     * alongside it.
     */
    tooltip?: string
  }

const TextFieldInner = forwardRef<ElementRef<'input'>, TextFieldProps>(
  (
    {
      control,
      helperText,
      label,
      name,
      optional = false,
      rules,
      size = 'medium',
      slotProps,
      state = 'default',
      tooltip,
      ...props
    },
    ref
  ) => {
    // invariant: the id comes from `useId` in both modes; keying it on `name`
    // made two fields with the same name share one id.
    const generatedFieldId = useId()
    const generatedHelperTextId = useId()
    const fieldId = props.id ?? generatedFieldId
    const helperTextId = slotProps?.helperText?.id ?? generatedHelperTextId
    const isRequired = label != null && label !== false && !optional

    const renderField = (
      fieldProps: Partial<FieldProps>,
      currentState: NonNullable<FieldProps['state']>,
      message: ReactNode
    ) => {
      const hasHelperText = message != null && message !== ''

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            fieldWrapper({ size }),
            slotProps?.wrapper?.className
          )}
        >
          {label && (
            <Label
              {...slotProps?.label}
              htmlFor={fieldId}
              optional={optional}
              size={size}
              tooltip={tooltip}
            >
              {label}
            </Label>
          )}
          <Field
            aria-describedby={hasHelperText ? helperTextId : undefined}
            aria-required={isRequired || undefined}
            size={size}
            {...props}
            {...fieldProps}
            id={fieldId}
            state={currentState}
          />
          {hasHelperText && (
            <FieldHelperText
              {...slotProps?.helperText}
              id={helperTextId}
              size={size}
              state={props.disabled ? 'default' : currentState}
            >
              {message}
            </FieldHelperText>
          )}
        </div>
      )
    }

    if (!name) {
      return renderField({ ref }, state, helperText)
    }

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { ref: fieldRef, ...field }, fieldState }) => {
          const errorMessage = fieldState.error?.message

          return renderField(
            { ...field, ref: mergeRefs(fieldRef, ref) },
            fieldState.error ? 'error' : state,
            errorMessage ?? helperText
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
