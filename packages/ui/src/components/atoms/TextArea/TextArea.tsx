'use client'

import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
  RefAttributes,
  useId,
  useRef,
  useState
} from 'react'
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions
} from 'react-hook-form'
import { FieldHelperText, Label } from '../TextField/components'
import {
  fieldControl,
  fieldText,
  fieldWrapper,
  mergeRefs
} from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: Lamb's TextArea has a single (large) size: padding 14/18, radius 16,
// type 18/28, and the counter sits under the text inside the same box.
const textArea = tv({
  slots: {
    root: 'flex w-full flex-col items-stretch gap-2 rounded-2xl px-4.5 py-3.5',
    textarea:
      'w-full min-w-0 resize-y bg-transparent text-size-100 outline-none',
    counter: 'self-end text-size-25 text-secondary'
  },
  variants: {
    state: {
      default: {},
      error: {},
      success: {}
    }
  },
  defaultVariants: {
    state: 'default'
  }
})

export type TextAreaProps<TFieldValues extends FieldValues = FieldValues> =
  ComponentProps<'textarea'> &
    VariantProps<typeof textArea> & {
      // `TFieldValues` defaults to the base `FieldValues` shape so TextArea
      // stays usable without a form (or without stating a schema), but a
      // caller passing a `Control<MySchema>`/`RegisterOptions<MySchema>` gets
      // that schema inferred through end-to-end, with no cast on their side.
      control?: Control<TFieldValues>
      helperText?: ReactNode
      label?: ReactNode
      name?: string
      /**
       * Whether the field is optional. Defaults to `false` (required) — pass
       * `true` to render the "(Opcional)" note next to the label instead of
       * the required asterisk. Same convention as `TextField`.
       */
      optional?: boolean
      rules?: RegisterOptions<TFieldValues>
      slotProps?: {
        counter?: ComponentProps<'span'>
        helperText?: ComponentProps<'p'>
        label?: ComponentProps<'label'>
        root?: ComponentProps<'div'>
        textarea?: ComponentProps<'textarea'>
        wrapper?: ComponentProps<'div'>
      }
      /**
       * Tooltip text shown next to the label, on an info icon button
       * rendered alongside it. Same convention as `TextField`.
       */
      tooltip?: string
    }

const TextAreaInner = forwardRef<ElementRef<'textarea'>, TextAreaProps>(
  (
    {
      className,
      control,
      helperText,
      label,
      name,
      optional = false,
      rows = 4,
      rules,
      slotProps,
      state = 'default',
      tooltip,
      ...props
    },
    ref
  ) => {
    const generatedFieldId = useId()
    const generatedHelperTextId = useId()
    const generatedCounterId = useId()
    const fieldId = props.id ?? generatedFieldId
    const helperTextId = slotProps?.helperText?.id ?? generatedHelperTextId
    const counterId = slotProps?.counter?.id ?? generatedCounterId
    const isRequired = label != null && label !== false && !optional
    const textareaRef = useRef<ElementRef<'textarea'>>(null)
    // invariant: only the unbound branch reads this; the RHF branch counts
    // `field.value` on every render.
    const [characterCount, setCharacterCount] = useState(
      () => String(props.defaultValue ?? props.value ?? '').length
    )

    const handleRootMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === textareaRef.current) return

      event.preventDefault()
      textareaRef.current?.focus()
    }

    const wrap = (
      errorMessage: string | undefined,
      forwardedRef: Ref<HTMLTextAreaElement> | undefined,
      textareaProps: ComponentProps<'textarea'>,
      currentCharacterCount: number
    ) => {
      const currentState = errorMessage ? 'error' : state
      const message = errorMessage ?? helperText
      const hasHelperText = message != null && message !== ''
      const disabled = Boolean(textareaProps.disabled)
      const { maxLength } = textareaProps
      const hasCounter = maxLength != null
      const slots = textArea({ state: currentState })
      const describedBy =
        [
          textareaProps['aria-describedby'],
          hasHelperText ? helperTextId : undefined,
          hasCounter ? counterId : undefined
        ]
          .filter(Boolean)
          .join(' ') || undefined

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            fieldWrapper({ className: 'w-full', size: 'large' }),
            slotProps?.wrapper?.className
          )}
        >
          {label && (
            <Label
              {...slotProps?.label}
              htmlFor={fieldId}
              optional={optional}
              size="large"
              tooltip={tooltip}
            >
              {label}
            </Label>
          )}
          <div
            {...slotProps?.root}
            className={twMerge(
              fieldControl({ disabled, state: currentState }),
              slots.root(),
              slotProps?.root?.className
            )}
            onMouseDown={handleRootMouseDown}
          >
            <textarea
              aria-invalid={currentState === 'error' || undefined}
              aria-required={isRequired || undefined}
              rows={rows}
              {...textareaProps}
              {...slotProps?.textarea}
              aria-describedby={describedBy}
              className={twMerge(
                slots.textarea({ className }),
                fieldText({ disabled }),
                slotProps?.textarea?.className
              )}
              id={fieldId}
              ref={mergeRefs(textareaRef, forwardedRef)}
            />
            {hasCounter && (
              <span
                aria-live="polite"
                {...slotProps?.counter}
                className={slots.counter({
                  className: slotProps?.counter?.className
                })}
                id={counterId}
              >
                {currentCharacterCount}/{maxLength}
                <span className="sr-only"> caracteres</span>
              </span>
            )}
          </div>
          {hasHelperText && (
            <FieldHelperText
              {...slotProps?.helperText}
              id={helperTextId}
              size="large"
              state={disabled ? 'default' : currentState}
            >
              {message}
            </FieldHelperText>
          )}
        </div>
      )
    }

    if (!name) {
      return wrap(
        undefined,
        ref,
        {
          ...props,
          onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
            setCharacterCount(event.target.value.length)
            props.onChange?.(event)
          }
        },
        characterCount
      )
    }

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { ref: fieldRef, ...field }, fieldState }) =>
          wrap(
            fieldState.error?.message,
            mergeRefs(fieldRef, ref),
            { ...props, ...field },
            String(field.value ?? '').length
          )
        }
      />
    )
  }
)
TextAreaInner.displayName = 'TextArea'

// `forwardRef` erases the render function's own generics, so the exotic
// component it returns is cast back to a generic call signature here. This
// is a type-only cast (the rendered component is unchanged) that lets
// callers bind `TextArea` to their form's real field-values type end to
// end — see `TextAreaProps` above — instead of the component internally
// accepting `Control<any>`/`RegisterOptions<any>`.
export const TextArea = TextAreaInner as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: TextAreaProps<TFieldValues> & RefAttributes<ElementRef<'textarea'>>
) => ReactElement | null
