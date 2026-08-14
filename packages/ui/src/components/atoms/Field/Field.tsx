'use client'

import {
  ComponentProps,
  ElementRef,
  forwardRef,
  MouseEvent,
  ReactElement,
  useRef,
  useState
} from 'react'
import {
  FIELD_ICON_COLOR,
  fieldActionButton,
  fieldControl,
  fieldText,
  getClonedResizedIcons,
  mergeRefs
} from '@church/ui/utils'
import { Icon, IconProps } from '../Icon'

import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const field = tv({
  slots: {
    root: 'flex items-center gap-2',
    input: 'min-w-0 flex-1 bg-transparent outline-none'
  },
  variants: {
    readOnly: {
      true: {
        root: 'cursor-default',
        input: 'cursor-default'
      }
    },
    size: {
      small: {
        root: 'h-8 rounded-lg px-3 py-1.5',
        input: 'text-size-50'
      },
      medium: {
        root: 'h-12 rounded-xl px-3.5 py-3',
        input: 'text-size-75'
      },
      large: {
        root: 'h-14 rounded-2xl px-4.5 py-3.5',
        input: 'text-size-100'
      }
    },
    variant: {
      default: {}
    },
    state: {
      default: {},
      error: {},
      success: {}
    }
  },
  compoundVariants: [
    {
      readOnly: true,
      class: {
        root: 'border-0 bg-transparent px-0 py-0 ring-0 focus-within:ring-0'
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
    endAdornment?: ReactElement<IconProps>
    startAdornment?: ReactElement<IconProps>
  }

export const Field = forwardRef<ElementRef<'input'>, FieldProps>(
  (
    {
      className,
      endAdornment,
      readOnly,
      size = 'medium',
      startAdornment,
      state = 'default',
      type,
      variant,
      ...props
    },
    ref
  ) => {
    const disabled = Boolean(props.disabled)
    const [visible, setVisible] = useState(false)
    const inputRef = useRef<ElementRef<'input'>>(null)

    const slots = field({ readOnly, size, state, variant })
    const [startIcon, endIcon] = getClonedResizedIcons({
      className: FIELD_ICON_COLOR,
      disabled,
      icons: [startAdornment, endAdornment],
      size
    })

    const handleRootMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement

      if (target === inputRef.current || target.closest('button')) {
        return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    const isPassword = type === 'password'

    return (
      <div
        className={twMerge(
          fieldControl({ disabled, state }),
          slots.root({ className })
        )}
        onMouseDown={handleRootMouseDown}
      >
        {startIcon}
        <input
          aria-invalid={state === 'error' || undefined}
          {...props}
          ref={mergeRefs(inputRef, ref)}
          readOnly={readOnly}
          type={isPassword && visible ? 'text' : type}
          className={twMerge(slots.input(), fieldText({ disabled }))}
        />
        {isPassword && !readOnly && (
          <button
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            className={fieldActionButton({ size })}
            disabled={disabled}
            onClick={() => setVisible(prev => !prev)}
            type="button"
          >
            <Icon
              className={FIELD_ICON_COLOR}
              disabled={disabled}
              name={visible ? 'visibility_off' : 'visibility'}
              size={size}
            />
          </button>
        )}
        {endIcon}
      </div>
    )
  }
)
Field.displayName = 'Field'
