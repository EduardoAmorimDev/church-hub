'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ComponentProps, ElementRef, forwardRef, ReactNode, useId } from 'react'
import { Icon } from '../Icon'
import { HelperText } from '../TextField/components'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// Checkbox glyph size per control size — roughly 3/4 of the box, one Icon
// size step below what `getClonedResizedIcons`' `forward` map would give a
// same-named `Field` size, since a checkbox's own box (16/24/32px) is much
// smaller than a text field's height.
const iconSizeBySize = {
  small: 'xSmall',
  medium: 'small',
  large: 'medium'
} as const

const checkbox = tv({
  slots: {
    wrapper: 'flex flex-col gap-1.5',
    row: 'flex items-center gap-2',
    // `inset-ring` (an inset box-shadow) rather than a real `border` — same
    // reasoning as `Field`/`TextArea` (see `fieldRingStyles.ts`): a real
    // border is part of the box model, so the box would grow past its
    // 16/24/32px spec the moment a border is added, and shrink back when
    // it's removed (checked/disabled), shifting the label next to it.
    // `outline-none` drops the browser default focus ring; `focus-visible:
    // ring-*` replaces it with an *outer* ring — a separate box-shadow layer
    // from the state variants' `inset-ring` border below, so the two never
    // fight over the same property — so a visible indicator exists even
    // when checked, where the state variants below leave no border at all
    // (spec.md FR-012, non-negotiable per the constitution's accessibility
    // bar).
    control: [
      'flex shrink-0 items-center justify-center outline-none',
      'cursor-pointer disabled:cursor-not-allowed',
      'not-disabled:focus-visible:ring-2 not-disabled:focus-visible:ring-neutral-999',
      'transition-[background-color,box-shadow]'
    ],
    // Always neutral-00 — every state (default/error/success) and disabled
    // all agree the check/dash glyph is neutral-00 (spec.md FR-008, FR-009),
    // so this never needs to vary.
    icon: 'text-neutral-00',
    label: 'cursor-pointer text-neutral-100'
  },
  variants: {
    size: {
      small: { control: 'size-4 rounded-md', label: 'text-size-50' },
      medium: { control: 'size-6 rounded-lg', label: 'text-size-75' },
      large: { control: 'size-8 rounded-10', label: 'text-size-100' }
    },
    // Every class here is `not-disabled:`-gated so it can never fight with
    // the `disabled` variant below over the same property — when disabled,
    // none of these match at all, and `disabled`'s plain (unconditioned)
    // classes are the only ones painting the control. Radix sets
    // `data-state` itself (`checked`/`unchecked`/`indeterminate`), which is
    // why this is driven by a `data-*` selector rather than a JS-computed
    // class list — see `research.md` R3.
    state: {
      default: {
        control: [
          'not-disabled:data-[state=unchecked]:inset-ring',
          'not-disabled:data-[state=unchecked]:inset-ring-neutral-33',
          'not-disabled:data-[state=unchecked]:bg-neutral-00',
          'not-disabled:data-[state=checked]:bg-neutral-999',
          'not-disabled:data-[state=indeterminate]:bg-neutral-999'
        ]
      },
      error: {
        control: [
          'not-disabled:data-[state=unchecked]:inset-ring',
          'not-disabled:data-[state=unchecked]:inset-ring-red-67',
          'not-disabled:data-[state=unchecked]:bg-neutral-00',
          'not-disabled:data-[state=checked]:bg-red-67',
          'not-disabled:data-[state=indeterminate]:bg-red-67'
        ]
      },
      success: {
        control: [
          'not-disabled:data-[state=unchecked]:inset-ring',
          'not-disabled:data-[state=unchecked]:inset-ring-green-67',
          'not-disabled:data-[state=unchecked]:bg-neutral-00',
          'not-disabled:data-[state=checked]:bg-green-67',
          'not-disabled:data-[state=indeterminate]:bg-green-67'
        ]
      }
    },
    // Resolved by spec.md's Clarifications Q1: disabled always overrides
    // `state` — never red/green while disabled — and never shows a ring.
    // Driven straight off the real `disabled` prop (already known in JS),
    // matching `Field`'s own disabled variant. Folds the label's disabled
    // look in here too, rather than a separate manual class-swap in JSX, so
    // `disabled`'s styling lives in one place.
    disabled: {
      true: {
        control: 'bg-neutral-67',
        label: 'cursor-not-allowed text-neutral-67'
      }
    }
  },
  defaultVariants: {
    size: 'medium',
    state: 'default'
  }
})

export type CheckboxProps = Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  'checked' | 'defaultChecked' | 'onCheckedChange' | 'asChild'
> &
  VariantProps<typeof checkbox> & {
    checked?: boolean
    defaultChecked?: boolean
    /** Fires whenever the user toggles the checkbox — never reports the
     * `"indeterminate"` value Radix's own callback type allows, since only
     * `indeterminate` (a prop) puts the control in that state, never a
     * click (see `research.md` R3 for why). */
    onCheckedChange?: (checked: boolean) => void
    helperText?: ReactNode
    /** When `true`, renders the dash ("mixed selection") glyph instead of
     * the checkmark, regardless of `checked` (spec.md FR-005). */
    indeterminate?: boolean
    label?: ReactNode
  }

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      checked,
      className,
      defaultChecked,
      disabled,
      helperText,
      id,
      indeterminate = false,
      label,
      onCheckedChange,
      size = 'medium',
      state = 'default',
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const controlId = id ?? generatedId
    const slots = checkbox({ disabled, size, state })

    // `indeterminate` always wins over `checked` (FR-005) — translating both
    // of this component's own booleans into Radix's single tri-state
    // `checked` prop, which is what actually drives the `data-state`
    // selectors above and the glyph choice below.
    const radixChecked = indeterminate ? 'indeterminate' : checked
    const radixDefaultChecked = indeterminate ? 'indeterminate' : defaultChecked

    return (
      <div className={slots.wrapper()}>
        <div className={slots.row()}>
          <CheckboxPrimitive.Root
            {...props}
            checked={radixChecked}
            className={twMerge(slots.control(), className)}
            defaultChecked={radixDefaultChecked}
            disabled={disabled}
            id={controlId}
            onCheckedChange={next => onCheckedChange?.(next === true)}
            ref={ref}
          >
            <CheckboxPrimitive.Indicator className="flex">
              <Icon
                className={slots.icon()}
                name={indeterminate ? 'horizontal_rule' : 'check'}
                size={iconSizeBySize[size]}
              />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          {label != null && (
            <label className={slots.label()} htmlFor={controlId}>
              {label}
            </label>
          )}
        </div>
        {helperText != null && (
          // `disabled` always resolves to `state="default"`, which already
          // maps to `text-neutral-67` (spec.md FR-009) — no extra className
          // override needed on top of it.
          <HelperText state={disabled ? 'default' : state}>
            {helperText}
          </HelperText>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'
