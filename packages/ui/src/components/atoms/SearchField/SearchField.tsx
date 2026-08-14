'use client'

import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
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
import { HelperText, Label } from '../TextField/components'
import { mergeRefs, neutralFieldIconColor } from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv } from '@church/ui/lib/tailwind-variants'

// Same neutral-67/100 icon state machine `Field` applies to its own icons
// (no hover/press dip) — applied by hand here because the clear button is a
// plain `<button>` (not a bare `Icon`), so `Field`'s adornment cloning
// passes it through untouched.
const CLEAR_ICON_COLOR = neutralFieldIconColor('input')

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
    rules?: RegisterOptions<TFieldValues>
    slotProps?: {
      clearButton?: ComponentProps<'button'>
      helperText?: ComponentProps<'span'>
      label?: ComponentProps<'label'>
      wrapper?: ComponentProps<'div'>
    }
  }

const clearButton = tv({
  variants: {
    size: {
      small: 'text-icon-16',
      medium: 'text-icon-20',
      large: 'text-icon-24'
    }
  },
  defaultVariants: { size: 'medium' }
})

const SearchFieldInner = forwardRef<ElementRef<'input'>, SearchFieldProps>(
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
      ...props
    },
    ref
  ) => {
    // Always declared so the hook order is stable across renders; only the
    // unbound branch reads it (a `name`-driven branch is fully controlled).
    const [inputValue, setInputValue] = useState(defaultValue ?? '')
    const generatedFieldId = useId()
    const generatedHelperTextId = useId()
    const helperTextId = slotProps?.helperText?.id ?? generatedHelperTextId
    // Falls back to a generated id when there's no `name` (unbound usage) —
    // without one, `Label`'s `htmlFor` has nothing to point at and clicking
    // it never focuses the input.
    const fieldId = name ?? props.id ?? generatedFieldId

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
          {label && (
            <Label
              {...slotProps?.label}
              disabled={props.disabled}
              htmlFor={fieldId}
              size={props.size}
            >
              {label}
            </Label>
          )}
          <Field
            aria-describedby={helperText ? helperTextId : undefined}
            {...props}
            id={fieldId}
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
                  <Icon className={CLEAR_ICON_COLOR} name="close" />
                </button>
              ) : undefined
            }
            onChange={event => {
              if (!isControlled) setInputValue(event.target.value)
              props.onChange?.(event)
            }}
            ref={ref}
            startAdornment={startAdornment ?? <Icon name="search" />}
            value={visibleValue ?? ''}
          />
          {helperText && (
            <HelperText {...slotProps?.helperText} id={helperTextId}>
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
          // No `state` prop to derive a visual error style from — the
          // validation message still surfaces through `helperText` below,
          // just without a red border/icon (SearchField has no error/success
          // visual state).
          const errorMessage = fieldState.error?.message
          const currentValue = field.value ?? ''
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
                  disabled={props.disabled}
                  htmlFor={fieldId}
                  size={props.size}
                >
                  {label}
                </Label>
              )}
              <Field
                aria-describedby={hasHelperText ? helperTextId : undefined}
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
                      <Icon className={CLEAR_ICON_COLOR} name="close" />
                    </button>
                  ) : undefined
                }
                id={fieldId}
                ref={mergeRefs(fieldRef, ref)}
                startAdornment={startAdornment ?? <Icon name="search" />}
              />
              {hasHelperText && (
                <HelperText {...slotProps?.helperText} id={helperTextId}>
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
