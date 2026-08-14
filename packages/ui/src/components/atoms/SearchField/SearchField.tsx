'use client'

import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  RefAttributes,
  useId,
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
import { FieldHelperText, Label } from '../TextField/components'
import {
  FIELD_ICON_COLOR,
  fieldActionButton,
  fieldWrapper,
  mergeRefs
} from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'

export type SearchFieldProps<TFieldValues extends FieldValues = FieldValues> =
  // `state` (error/success) and `readOnly` don't apply to SearchField — the
  // design only defines enabled/hover/pressed/filled/disabled/focused, all
  // of which `Field` already renders through its `default` state.
  Omit<FieldProps, 'slotProps' | 'state' | 'readOnly'> & {
    // `TFieldValues` defaults to the base `FieldValues` shape so SearchField
    // stays usable without a form (or without stating a schema), but a
    // caller passing a `Control<MySchema>`/`RegisterOptions<MySchema>` gets
    // that schema inferred through end-to-end, with no cast on their side.
    control?: Control<TFieldValues>
    helperText?: ReactNode
    label?: ReactNode
    name?: string
    onClear?: () => void
    onSearch?: (value: string) => void
    rules?: RegisterOptions<TFieldValues>
    slotProps?: {
      clearButton?: ComponentProps<'button'>
      helperText?: ComponentProps<'p'>
      label?: ComponentProps<'label'>
      wrapper?: ComponentProps<'div'>
    }
  }

// why: the field draws its own clear button; the browser's native "x" on
// `type="search"` would be a second one.
const HIDE_NATIVE_CLEAR =
  '[&_input::-webkit-search-cancel-button]:appearance-none'

const SearchFieldInner = forwardRef<ElementRef<'input'>, SearchFieldProps>(
  (
    {
      className,
      control,
      defaultValue,
      helperText,
      label,
      name,
      onClear,
      onKeyDown,
      onSearch,
      placeholder = 'Buscar',
      rules,
      size = 'medium',
      slotProps,
      startAdornment,
      type = 'search',
      ...props
    },
    ref
  ) => {
    // invariant: declared in both modes for a stable hook order; only the
    // unbound branch reads it (the RHF branch is fully controlled).
    const [inputValue, setInputValue] = useState(defaultValue ?? '')
    const generatedFieldId = useId()
    const generatedHelperTextId = useId()
    const fieldId = props.id ?? generatedFieldId
    const helperTextId = slotProps?.helperText?.id ?? generatedHelperTextId

    const renderSearch = ({
      fieldProps,
      message,
      setValue,
      value
    }: {
      fieldProps: Partial<FieldProps>
      message: ReactNode
      setValue: (value: string) => void
      value: string
    }) => {
      const hasHelperText = message != null && message !== ''
      const clear = () => {
        setValue('')
        onClear?.()
      }
      const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event)
        if (event.key === 'Enter') onSearch?.(value)
        if (event.key === 'Escape' && value !== '') clear()
      }

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            fieldWrapper({ size }),
            slotProps?.wrapper?.className
          )}
          role="search"
        >
          {label && (
            <Label {...slotProps?.label} htmlFor={fieldId} size={size}>
              {label}
            </Label>
          )}
          <Field
            aria-describedby={hasHelperText ? helperTextId : undefined}
            aria-label={label ? undefined : 'Buscar'}
            placeholder={placeholder}
            size={size}
            type={type}
            {...props}
            {...fieldProps}
            className={twMerge(HIDE_NATIVE_CLEAR, className)}
            endAdornment={
              value !== '' && !props.disabled ? (
                <button
                  {...slotProps?.clearButton}
                  aria-label="Limpar busca"
                  className={fieldActionButton({
                    className: slotProps?.clearButton?.className,
                    size
                  })}
                  onClick={clear}
                  type="button"
                >
                  <Icon className={FIELD_ICON_COLOR} name="close" size={size} />
                </button>
              ) : undefined
            }
            id={fieldId}
            onKeyDown={handleKeyDown}
            startAdornment={startAdornment ?? <Icon name="search" />}
          />
          {hasHelperText && (
            <FieldHelperText
              {...slotProps?.helperText}
              id={helperTextId}
              size={size}
            >
              {message}
            </FieldHelperText>
          )}
        </div>
      )
    }

    if (!name) {
      // invariant: a `value` prop keeps the caller in control; otherwise the
      // value lives here so the clear button can follow it without a form.
      const isControlled = 'value' in props
      const value = String((isControlled ? props.value : inputValue) ?? '')

      return renderSearch({
        fieldProps: {
          onChange: event => {
            if (!isControlled) setInputValue(event.target.value)
            props.onChange?.(event)
          },
          ref,
          value
        },
        message: helperText,
        setValue: next => {
          if (!isControlled) setInputValue(next)
          props.onChange?.({
            target: { value: next },
            currentTarget: { value: next }
          } as ChangeEvent<HTMLInputElement>)
        },
        value
      })
    }

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { ref: fieldRef, ...field }, fieldState }) =>
          renderSearch({
            fieldProps: { ...field, ref: mergeRefs(fieldRef, ref) },
            message: fieldState.error?.message ?? helperText,
            setValue: next => field.onChange(next),
            value: String(field.value ?? '')
          })
        }
      />
    )
  }
)
SearchFieldInner.displayName = 'SearchField'

// `forwardRef` erases the render function's own generics, so the exotic
// component it returns is cast back to a generic call signature here. This
// is a type-only cast (the rendered component is unchanged) that lets
// callers bind `SearchField` to their form's real field-values type end to
// end — see `SearchFieldProps` above — instead of the component internally
// accepting `Control<any>`/`RegisterOptions<any>`.
export const SearchField = SearchFieldInner as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: SearchFieldProps<TFieldValues> & RefAttributes<ElementRef<'input'>>
) => ReactElement | null
