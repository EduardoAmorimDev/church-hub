'use client'

import { ComponentProps, ElementRef, forwardRef, ReactNode, Ref } from 'react'
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions
} from 'react-hook-form'
import { HelperText, Label } from '../TextField/components'
import { mergeRefs } from '~/components/utils'
import { twMerge } from '~/lib/tailwind-merge'
import { tv, VariantProps } from '~/lib/tailwind-variants'

const textArea = tv({
  slots: {
    root: ['flex w-full', 'disabled:cursor-not-allowed disabled:opacity-50'],
    textarea: [
      'w-full resize-none overflow-y-auto bg-transparent outline-none',
      'disabled:cursor-not-allowed'
    ]
  },
  variants: {
    size: {
      large: {
        root: 'p-3.5',
        textarea: 'text-size-100'
      },
      medium: {
        root: 'p-3',
        textarea: 'text-size-75'
      },
      small: {
        root: 'p-1.5',
        textarea: 'text-size-50'
      }
    },
    state: {
      default: {
        root: 'border border-neutral-33'
      },
      error: {
        root: 'border border-red-67'
      },
      success: {
        root: 'border border-green-67'
      }
    }
  },
  defaultVariants: {
    size: 'medium',
    state: 'default'
  }
})

export type TextAreaProps = ComponentProps<'textarea'> &
  VariantProps<typeof textArea> & {
    // Loosely typed on purpose: TextArea is a generic, form-agnostic atom, so
    // it accepts a `Control` from any `useForm<T>()` shape rather than forcing
    // callers to align with a specific `FieldValues` type.
    control?: Control<any>
    helperText?: ReactNode
    label?: ReactNode
    name?: string
    rules?: RegisterOptions<FieldValues>
    slotProps?: {
      helperText?: ComponentProps<'span'>
      label?: ComponentProps<'label'>
      root?: ComponentProps<'div'>
      textarea?: ComponentProps<'textarea'>
      wrapper?: ComponentProps<'div'>
    }
  }

export const TextArea = forwardRef<ElementRef<'textarea'>, TextAreaProps>(
  (
    {
      className,
      control,
      helperText,
      label,
      name,
      rules,
      size,
      slotProps,
      state,
      ...props
    },
    ref
  ) => {
    const wrap = (
      errorMessage?: string,
      textareaRef?: Ref<HTMLTextAreaElement>,
      textareaProps: ComponentProps<'textarea'> = {}
    ) => {
      const currentState = errorMessage ? 'error' : state
      const slots = textArea({ size, state: currentState })

      return (
        <div
          {...slotProps?.wrapper}
          className={twMerge(
            'flex w-full flex-col gap-1.5',
            slotProps?.wrapper?.className
          )}
        >
          {label && (
            <Label {...slotProps?.label} htmlFor={name}>
              {label}
            </Label>
          )}
          <div
            {...slotProps?.root}
            className={twMerge(slots.root(), slotProps?.root?.className)}
          >
            <textarea
              {...textareaProps}
              {...slotProps?.textarea}
              className={twMerge(
                slots.textarea({ className }),
                slotProps?.textarea?.className
              )}
              id={name}
              ref={textareaRef}
            />
          </div>
          {(errorMessage ?? helperText) && (
            <HelperText
              {...slotProps?.helperText}
              state={currentState === 'error' ? 'error' : 'default'}
            >
              {errorMessage ?? helperText}
            </HelperText>
          )}
        </div>
      )
    }

    if (!name) {
      return wrap(undefined, ref, props)
    }

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { ref: fieldRef, ...field }, fieldState }) => {
          const errorMessage = fieldState.error?.message
          return wrap(errorMessage, mergeRefs(fieldRef, ref), {
            ...props,
            ...field
          })
        }}
      />
    )
  }
)
TextArea.displayName = 'TextArea'
