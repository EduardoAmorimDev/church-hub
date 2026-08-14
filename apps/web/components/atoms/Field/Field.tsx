'use client'

import {
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactElement,
  useMemo,
  useState
} from 'react'
import { Icon } from '../Icon'
import { getClonedResizedIcons } from '~/components/utils'

import { tv, VariantProps } from '~/lib/tailwind-variants'

const field = tv({
  slots: {
    root: [
      'flex items-center gap-2 rounded-md',
      'cursor-pointer',
      'has-[input:disabled]:bg-neutral-alpha/10',
      'has-[input:disabled]:text-neutral-33',
      'has-[input:disabled]:cursor-default',
      'has-[input:disabled]:border-0'
    ],
    input:
      'flex-1 bg-transparent outline-none cursor-pointer disabled:cursor-default',
    visibleButton: ''
  },
  variants: {
    size: {
      small: {
        root: 'px-3 py-1.5',
        input: 'text-size-50'
      },
      medium: {
        root: 'px-3.5 py-3',
        input: 'text-size-75'
      },
      large: {
        root: 'px-4.5 py-3.5',
        input: 'text-size-100'
      }
    },
    variant: {
      default: {},
      solid: {
        root: 'cursor-default',
        input: 'cursor-default'
      }
    },
    state: {
      default: {
        root: [
          'border border-neutral-33',
          'has-[input:focus]:border-2 has-[input:focus]:border-neutral-999'
        ]
      },
      error: {
        root: 'border-2 border-red-67'
      },
      success: {
        root: 'border-2 border-green-67'
      }
    }
  },
  compoundVariants: [
    {
      variant: 'solid',
      state: ['default', 'error', 'success'],
      class: {
        root: 'border-0 px-0 py-0 has-[input:focus]:border-0'
      }
    }
  ],
  defaultVariants: {
    size: 'medium',
    variant: 'default',
    state: 'default'
  }
})

export type FieldProps = Omit<ComponentProps<'input'>, 'size'> &
  VariantProps<typeof field> & {
    endAdornment?: ReactElement
    startAdornment?: ReactElement
    slotProps?: {
      root?: ComponentProps<'div'>
      input?: ComponentProps<'input'>
    }
  }

export const Field = forwardRef<ElementRef<'input'>, FieldProps>(
  (
    {
      className,
      endAdornment,
      size,
      slotProps,
      startAdornment,
      state,
      type,
      variant,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false)

    const slots = field({ size, state, variant })
    const [startIcon, endIcon, visibilityIcon] = useMemo(
      () =>
        getClonedResizedIcons({
          icons: [
            startAdornment,
            endAdornment,
            <Icon
              key="visibility_icon"
              name={visible ? 'visibility' : 'visibility_off'}
            />
          ],
          size,
          sizeStep: 'forward'
        }),
      [endAdornment, size, startAdornment, visible]
    )

    return (
      <div
        {...slotProps?.root}
        className={slots.root({ className: slotProps?.root?.className })}
      >
        {startIcon}
        <input
          {...slotProps?.input}
          {...props}
          ref={ref}
          type={visible ? 'text' : type}
          className={slots.input({ className })}
        />
        {type === 'password' && (
          <button
            type="button"
            className={slots.visibleButton()}
            onClick={() => setVisible(prev => !prev)}
          >
            {visibilityIcon}
          </button>
        )}
        {endIcon}
        {state === 'error' && <Icon name="error" />}
        {state === 'success' && <Icon name="check" />}
      </div>
    )
  }
)
Field.displayName = 'Field'
