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
import { HelperText, Label } from '../TextField/components'
import {
  fieldDefaultRing,
  FIELD_DISABLED_CONTROL,
  FIELD_DISABLED_ROOT,
  FIELD_ERROR_RING,
  FIELD_ROOT_TRANSITION,
  FIELD_SUCCESS_RING,
  mergeRefs,
  neutralFieldColor
} from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const textArea = tv({
  slots: {
    // `group` backs the neutral-67/33/100 placeholder color state machine
    // below (see `neutralFieldColor`), driven off the `<textarea>`'s own
    // pseudo-classes via `group-has-[textarea:...]`. `cursor-text` on
    // `root` (rather than only on the `textarea` itself) plus
    // `onMouseDown` on the wrapping `<div>` (see `TextAreaInner`) make
    // clicking anywhere in the padding around the textarea focus it too,
    // the same as `Field`. `rounded-2xl` (16px) matches `Field`'s `large`
    // size corner radius, the only one `TextArea` has (see the removal of
    // its `size` variant).
    root: [
      'relative flex w-full rounded-2xl px-4.5 py-3.5',
      'cursor-text',
      'group',
      FIELD_ROOT_TRANSITION
    ],
    // `h-20` (80px) plus `root`'s `py-3.5` (14px top/bottom) gives a 108px
    // initial field height. `resize` (both axes, rather than `resize-none`)
    // gives the browser's native drag handle in the bottom-right corner —
    // no JS/library needed for resizable behavior; the browser overrides
    // this initial height with an inline style once the user drags it.
    // `overflow-y-auto` still applies for content that grows past whatever
    // height the textarea is currently resized to.
    textarea: [
      'h-20 w-full resize overflow-y-auto bg-transparent text-size-75 outline-none',
      'cursor-text disabled:cursor-not-allowed',
      neutralFieldColor('textarea', 'text'),
      neutralFieldColor('textarea', 'placeholder:text')
    ],
    // `counter` floats over the textarea's own bottom-right corner,
    // offset further in (`right-8`) than `root`'s own padding so it clears
    // the browser's native resize grip — that grip sits at the `textarea`'s
    // actual bottom-right corner, `root`'s `px-4.5`/`py-3.5` in from `root`'s
    // edge. `pointer-events-none` lets mousedowns pass through to the real
    // `textarea` underneath, so dragging from here still resizes it;
    // `select-none` keeps it out of the user's text selection.
    counter:
      'pointer-events-none absolute bottom-3 right-8 select-none text-size-50 text-neutral-67'
  },
  variants: {
    // See `fieldDefaultRing`/`FIELD_ERROR_RING`/`FIELD_SUCCESS_RING` for why
    // this is an inset box-shadow ("border" in look only) instead of a real
    // border.
    state: {
      default: { root: fieldDefaultRing('textarea') },
      error: { root: FIELD_ERROR_RING },
      success: { root: FIELD_SUCCESS_RING }
    },
    // Driven straight off the real `disabled` prop (unlike the hover/focus
    // states above) since, unlike those, it's already known in JS — no
    // need for a `:has(textarea:disabled)` selector on `root`, which is a
    // plain `<div>` and can never itself match `:disabled`.
    disabled: {
      true: {
        root: FIELD_DISABLED_ROOT,
        textarea: FIELD_DISABLED_CONTROL
      }
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
        helperText?: ComponentProps<'span'>
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
      rules,
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
    // Falls back to a generated id when there's no `name` (unbound usage) —
    // without one, `Label`'s `htmlFor` has nothing to point at and clicking
    // it never focuses the textarea.
    const fieldId = name ?? props.id ?? generatedFieldId
    // Kept locally (merged into whatever ref `wrap` is given) purely so
    // `handleRootMouseDown` can focus the textarea — the same click-anywhere
    // affordance `Field` gives its input.
    const textareaRef = useRef<ElementRef<'textarea'>>(null)
    // Always declared so the hook order is stable across renders; only the
    // unbound branch reads/updates it — the RHF-bound branch derives the
    // count straight from `field.value` on every render instead.
    const [characterCount, setCharacterCount] = useState(
      () => String(props.defaultValue ?? props.value ?? '').length
    )

    const handleRootMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === textareaRef.current) return

      event.preventDefault()
      textareaRef.current?.focus()
    }

    const wrap = (
      errorMessage?: string,
      forwardedRef?: Ref<HTMLTextAreaElement>,
      textareaProps: ComponentProps<'textarea'> = {},
      currentCharacterCount = 0
    ) => {
      const currentState = errorMessage ? 'error' : state
      const hasHelperText = Boolean(errorMessage ?? helperText)
      const disabled = textareaProps.disabled
      const { maxLength } = textareaProps
      const hasCounter = maxLength != null
      const slots = textArea({ disabled, state: currentState })

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            'flex w-full flex-col gap-1.5',
            slotProps?.wrapper?.className
          )}
        >
          {label && (
            <Label
              {...slotProps?.label}
              disabled={disabled}
              htmlFor={fieldId}
              optional={optional}
              tooltip={tooltip}
            >
              {label}
            </Label>
          )}
          <div
            {...slotProps?.root}
            className={twMerge(slots.root(), slotProps?.root?.className)}
            onMouseDown={handleRootMouseDown}
          >
            <textarea
              aria-describedby={hasHelperText ? helperTextId : undefined}
              aria-invalid={currentState === 'error' || undefined}
              {...textareaProps}
              {...slotProps?.textarea}
              className={twMerge(
                slots.textarea({ className }),
                slotProps?.textarea?.className
              )}
              id={fieldId}
              ref={mergeRefs(textareaRef, forwardedRef)}
            />
            {hasCounter && (
              <span
                {...slotProps?.counter}
                className={slots.counter({
                  className: slotProps?.counter?.className
                })}
              >
                {currentCharacterCount}/{maxLength}
              </span>
            )}
          </div>
          {hasHelperText && (
            <HelperText
              {...slotProps?.helperText}
              id={helperTextId}
              state={currentState === 'error' ? 'error' : 'default'}
            >
              {errorMessage ?? helperText}
            </HelperText>
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
        render={({ field: { ref: fieldRef, ...field }, fieldState }) => {
          const errorMessage = fieldState.error?.message
          return wrap(
            errorMessage,
            mergeRefs(fieldRef, ref),
            { ...props, ...field },
            String(field.value ?? '').length
          )
        }}
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
