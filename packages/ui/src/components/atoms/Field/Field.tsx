'use client'

import {
  cloneElement,
  ComponentProps,
  ElementRef,
  forwardRef,
  MouseEvent,
  ReactElement,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  fieldDefaultRing,
  FIELD_DISABLED_CONTROL,
  FIELD_DISABLED_ROOT,
  FIELD_ERROR_RING,
  FIELD_ROOT_TRANSITION,
  FIELD_SUCCESS_RING,
  getClonedResizedIcons,
  mergeRefs,
  neutralFieldColor,
  neutralFieldIconColor
} from '@church/ui/utils'
import { Icon, IconProps } from '../Icon'

import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// Color for the field's non-status icons (start/end adornment, the lock
// icon, the visibility toggle) — neutral-67 by default, neutral-100 once
// focused/filled, no hover/press dip (unlike the field's typed text/
// placeholder, see `neutralFieldIconColor`). Disabled dims to neutral-33
// for free, through `Icon`'s own `color="neutral"` variant
// (`data-[disabled=true]:text-neutral-33`).
const NEUTRAL_ADORNMENT_COLOR = neutralFieldIconColor('input')

// Only actual `Icon` glyphs get resized/recolored by `Field` — an adornment
// like `SearchField`'s clear `<button>` is passed through untouched (same
// check `getClonedResizedIcons` uses for sizing) so it keeps styling its
// own icon.
const isIconElement = (icon?: ReactElement): icon is ReactElement<IconProps> =>
  Boolean(icon) &&
  typeof (icon as ReactElement<IconProps>).props.name === 'string'

const withNeutralAdornmentColor = (icon?: ReactElement<IconProps>) =>
  icon && isIconElement(icon)
    ? cloneElement(icon, {
        className: twMerge(NEUTRAL_ADORNMENT_COLOR, icon.props.className)
      })
    : icon

const field = tv({
  slots: {
    root: [
      'flex items-center gap-2',
      'cursor-text',
      'group',
      FIELD_ROOT_TRANSITION
    ],
    input: [
      'flex-1 bg-transparent outline-none cursor-text',
      neutralFieldColor('input', 'text'),
      neutralFieldColor('input', 'placeholder:text')
    ],
    visibleButton: [
      'flex rounded-full',
      'not-disabled:hover:bg-neutral-alpha/20 transition-colors'
    ]
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
        root: 'px-3 py-1.5 h-8 rounded-lg',
        input: 'text-size-50'
      },
      medium: {
        root: 'px-3.5 py-3 h-12 rounded-xl',
        input: 'text-size-75'
      },
      large: {
        root: 'px-4.5 py-3.5 h-14 rounded-2xl',
        input: 'text-size-100'
      }
    },
    variant: {
      default: {}
    },
    // See `fieldDefaultRing`/`FIELD_ERROR_RING`/`FIELD_SUCCESS_RING` for why
    // this is an inset box-shadow ("border" in look only) instead of a real
    // border.
    state: {
      default: { root: fieldDefaultRing('input') },
      error: { root: FIELD_ERROR_RING },
      success: { root: FIELD_SUCCESS_RING }
    },
    disabled: {
      true: {
        root: FIELD_DISABLED_ROOT,
        input: FIELD_DISABLED_CONTROL
      }
    }
  },
  compoundVariants: [
    {
      readOnly: true,
      state: ['default', 'error', 'success'],
      class: {
        root: 'inset-ring-0 px-0 py-0 has-[input:focus]:inset-ring-0'
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
      state,
      type,
      variant,
      ...props
    },
    ref
  ) => {
    const { disabled } = props
    const [visible, setVisible] = useState(false)
    const inputRef = useRef<ElementRef<'input'>>(null)

    const slots = field({ disabled, readOnly, size, state, variant })
    const [
      endIcon,
      errorIcon,
      lockIcon,
      startIcon,
      successIcon,
      visibilityIcon
    ] = useMemo(
      () =>
        getClonedResizedIcons({
          disabled,
          icons: [
            withNeutralAdornmentColor(endAdornment),
            <Icon key="error_icon" color="red" name="error" />,
            <Icon
              key="lock"
              className={NEUTRAL_ADORNMENT_COLOR}
              color="neutral"
              name="lock"
            />,
            withNeutralAdornmentColor(startAdornment),
            <Icon key="success_icon" color="green" name="check" />,
            <Icon
              key="visibility_icon"
              className={NEUTRAL_ADORNMENT_COLOR}
              name={visible ? 'visibility' : 'visibility_off'}
            />
          ],
          size,
          sizeStep: 'forward'
        }),
      [endAdornment, disabled, size, startAdornment, visible]
    )

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
        className={slots.root({ className })}
        onMouseDown={handleRootMouseDown}
      >
        {startIcon}
        {isPassword && !readOnly && lockIcon}
        <input
          aria-invalid={state === 'error' || undefined}
          // `:placeholder-shown` only ever matches an input that actually
          // has a (non-empty) placeholder attribute — without this
          // fallback, a field with no placeholder would permanently match
          // `:not(:placeholder-shown)`, and the adornment/lock/visibility
          // icons above would render as "has value" even when empty.
          placeholder=" "
          {...props}
          ref={mergeRefs(inputRef, ref)}
          readOnly={readOnly}
          type={visible ? 'text' : type}
          className={slots.input()}
        />
        {isPassword && !readOnly && (
          <button
            aria-label={visible ? 'hide password' : 'show password'}
            aria-pressed={visible}
            disabled={disabled}
            type="button"
            className={slots.visibleButton()}
            onClick={() => setVisible(prev => !prev)}
          >
            {visibilityIcon}
          </button>
        )}
        {endIcon}
        {state === 'error' && errorIcon}
        {state === 'success' && successIcon}
      </div>
    )
  }
)
Field.displayName = 'Field'
