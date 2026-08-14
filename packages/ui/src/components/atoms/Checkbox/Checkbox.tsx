'use client'

import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'
import { Icon } from '../Icon'
import { HelperText } from '../TextField/components'
import { mergeRefs } from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: Lamb glyphs are 14/20/26px; 14 and 26 have no named `Icon` size, so
// the nearest one is overridden with the icon token.
const GLYPH_BY_SIZE = {
  small: { size: 'xSmall', className: 'text-icon-14!' },
  medium: { size: 'medium', className: '' },
  large: { size: 'xLarge', className: 'text-icon-26!' }
} as const

// invariant: the native input is the visible box (`appearance-none`) and the
// row's first child, so the global focus outline lands on it and the glyph
// overlays it from the row's left edge; `not-disabled:` keeps state colours
// off a disabled control.
const checkbox = tv({
  slots: {
    wrapper: 'flex flex-col gap-1.5',
    row: 'group relative inline-flex cursor-pointer items-center gap-2',
    control: [
      'm-0 shrink-0 cursor-pointer appearance-none border-2',
      'transition-[background-color,border-color] duration-250',
      'disabled:cursor-not-allowed'
    ],
    glyph: [
      'pointer-events-none absolute top-1/2 left-0 flex -translate-y-1/2',
      'items-center justify-center text-neutral-00'
    ],
    label: 'font-medium text-primary'
  },
  variants: {
    size: {
      small: {
        control: 'size-4 rounded-md',
        glyph: 'size-4',
        label: 'text-size-50'
      },
      medium: {
        control: 'size-6 rounded-lg',
        glyph: 'size-6',
        label: 'text-size-75'
      },
      large: {
        control: 'size-8 rounded-10',
        glyph: 'size-8',
        label: 'text-size-100 leading-8'
      }
    },
    state: {
      default: {
        control: [
          'not-disabled:data-[state=unchecked]:border-control',
          'not-disabled:data-[state=unchecked]:bg-surface',
          'not-disabled:data-[state=unchecked]:group-hover:border-neutral-83',
          'not-disabled:data-[state=unchecked]:group-hover:bg-hover',
          'not-disabled:data-[state=checked]:border-neutral-999',
          'not-disabled:data-[state=checked]:bg-neutral-999',
          'not-disabled:data-[state=indeterminate]:border-neutral-999',
          'not-disabled:data-[state=indeterminate]:bg-neutral-999'
        ]
      },
      // why: danger-solid is red-67 and positive-solid green-83 in both
      // themes; borders use the primitive, fills the semantic token.
      error: {
        control: [
          'not-disabled:data-[state=unchecked]:border-red-67',
          'not-disabled:data-[state=unchecked]:bg-surface',
          'not-disabled:data-[state=checked]:border-red-67',
          'not-disabled:data-[state=checked]:bg-danger-solid',
          'not-disabled:data-[state=indeterminate]:border-red-67',
          'not-disabled:data-[state=indeterminate]:bg-danger-solid'
        ]
      },
      success: {
        control: [
          'not-disabled:data-[state=unchecked]:border-green-83',
          'not-disabled:data-[state=unchecked]:bg-surface',
          'not-disabled:data-[state=checked]:border-green-83',
          'not-disabled:data-[state=checked]:bg-positive-solid',
          'not-disabled:data-[state=indeterminate]:border-green-83',
          'not-disabled:data-[state=indeterminate]:bg-positive-solid'
        ]
      }
    },
    disabled: {
      true: {
        row: 'cursor-not-allowed',
        control: 'border-neutral-33 bg-disabled',
        glyph: 'text-disabled',
        label: 'text-disabled'
      }
    }
  },
  defaultVariants: {
    size: 'medium',
    state: 'default'
  }
})

export type CheckboxProps = Omit<
  ComponentProps<'input'>,
  'checked' | 'children' | 'defaultChecked' | 'size' | 'type'
> &
  VariantProps<typeof checkbox> & {
    checked?: boolean
    defaultChecked?: boolean
    /** invariant: reports a boolean; only the `indeterminate` prop sets the
     * mixed state, never a click. */
    onCheckedChange?: (checked: boolean) => void
    helperText?: ReactNode
    /** invariant: wins over `checked` and shows the dash glyph. */
    indeterminate?: boolean
    label?: ReactNode
  }

export const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      checked,
      className,
      defaultChecked,
      disabled,
      helperText,
      id,
      indeterminate = false,
      label,
      onChange,
      onCheckedChange,
      size = 'medium',
      state = 'default',
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const controlId = id ?? generatedId
    const helperId = `${controlId}-helper`
    const inputRef = useRef<HTMLInputElement>(null)
    const [uncontrolledChecked, setUncontrolledChecked] = useState(
      defaultChecked ?? false
    )
    const isChecked = checked ?? uncontrolledChecked
    const dataState = indeterminate
      ? 'indeterminate'
      : isChecked
        ? 'checked'
        : 'unchecked'
    const slots = checkbox({ disabled, size, state })
    const glyph = GLYPH_BY_SIZE[size]

    // hazard: a click clears the DOM `indeterminate` flag on its own, so it is
    // re-applied after every render rather than only when the prop changes.
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate
    })

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) setUncontrolledChecked(event.target.checked)
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    const describedBy =
      [ariaDescribedBy, helperText != null ? helperId : undefined]
        .filter(Boolean)
        .join(' ') || undefined
    const Row = label != null ? 'label' : 'span'

    return (
      <div className={slots.wrapper()}>
        <Row className={slots.row()}>
          <input
            {...props}
            aria-describedby={describedBy}
            aria-invalid={state === 'error' ? true : ariaInvalid}
            checked={isChecked}
            className={twMerge(slots.control(), className)}
            data-state={dataState}
            disabled={disabled}
            id={controlId}
            onChange={handleChange}
            ref={mergeRefs(ref, inputRef)}
            type="checkbox"
          />
          {dataState !== 'unchecked' && (
            <Icon
              className={twMerge(slots.glyph(), glyph.className)}
              name={indeterminate ? 'remove' : 'check'}
              size={glyph.size}
            />
          )}
          {label != null && <span className={slots.label()}>{label}</span>}
        </Row>
        {helperText != null && (
          <HelperText id={helperId} state={disabled ? 'default' : state}>
            {helperText}
          </HelperText>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'
