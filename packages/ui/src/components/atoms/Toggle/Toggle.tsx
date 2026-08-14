'use client'

import { ReactNode, useId, useState } from 'react'
import { Icon } from '../Icon'
import { Spinner } from '../Spinner'
import { TOGGLE_TOUCH_ROW } from './data'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: Lamb glyphs sit 2px inside the thumb; 14 has no named `Icon` size, so
// the medium thumb overrides the xSmall glyph with the icon token.
const GLYPH_BY_SIZE = {
  small: { size: 'xSmall', className: '' },
  medium: { size: 'xSmall', className: 'text-icon-14!' },
  large: { size: 'medium', className: '' }
} as const

// invariant: the thumb sits 2px inside the 2px border; "on" slides it to 2px
// from the right edge (track - thumb - 8px) and pressing widens it by 4px.
const toggle = tv({
  slots: {
    row: ['inline-flex items-center gap-3 text-primary', TOGGLE_TOUCH_ROW],
    track: [
      'relative m-0 shrink-0 cursor-pointer rounded-full border-2 p-0',
      'transition-[background-color,border-color] duration-200 ease-out',
      'after:absolute after:top-1/2 after:left-1/2 after:h-11 after:-translate-1/2'
    ],
    thumb: [
      'pointer-events-none absolute top-0.5 left-0.5 inline-flex items-center justify-center rounded-full',
      'transition-[translate,width,background-color] duration-200 ease-out'
    ],
    text: 'flex min-w-0 flex-col gap-0.5',
    label: 'cursor-pointer font-medium',
    description: 'text-size-50 font-normal text-secondary',
    stateText: 'min-w-16 self-center text-size-50 font-medium text-secondary'
  },
  variants: {
    size: {
      small: {
        track: 'h-5 w-8 after:w-11',
        thumb: 'size-3 group-active/track:w-4',
        label: 'text-size-50 leading-5'
      },
      medium: {
        track: 'h-6 w-10 after:w-11',
        thumb: 'size-4 group-active/track:w-5',
        label: 'text-size-75'
      },
      large: {
        track: 'h-8 w-13 after:w-13',
        thumb: 'size-6 group-active/track:w-7',
        label: 'text-size-100 leading-8'
      }
    },
    color: {
      neutral: {},
      accent: {}
    },
    on: {
      true: { thumb: 'bg-neutral-00' },
      false: {
        track: 'border-control bg-surface',
        thumb: 'translate-x-0 bg-neutral-67'
      }
    },
    labelPosition: {
      right: {},
      left: { row: 'flex w-full justify-between' }
    },
    busy: {
      true: { track: 'cursor-progress', thumb: 'text-primary' }
    },
    disabled: {
      true: {
        track: 'cursor-not-allowed border-neutral-33 bg-disabled',
        thumb: 'bg-neutral-33 text-disabled',
        label: 'cursor-not-allowed text-disabled',
        description: 'text-disabled'
      }
    }
  },
  compoundVariants: [
    {
      on: true,
      size: 'small',
      class: { thumb: 'translate-x-3 group-active/track:translate-x-2' }
    },
    {
      on: true,
      size: 'medium',
      class: { thumb: 'translate-x-4 group-active/track:translate-x-3' }
    },
    {
      on: true,
      size: 'large',
      class: { thumb: 'translate-x-5 group-active/track:translate-x-4' }
    },
    {
      on: true,
      color: 'neutral',
      class: {
        track:
          'border-neutral-999 bg-action-primary not-disabled:hover:border-neutral-100 not-disabled:hover:bg-neutral-100',
        thumb: 'text-neutral-999'
      }
    },
    {
      on: true,
      color: 'accent',
      class: {
        track:
          'border-blue-67 bg-accent-solid not-disabled:hover:border-blue-83 not-disabled:hover:bg-blue-83',
        thumb: 'text-accent'
      }
    },
    {
      on: false,
      disabled: false,
      class: { track: 'hover:border-neutral-83 hover:bg-hover' }
    },
    {
      on: true,
      disabled: true,
      class: {
        track: 'border-neutral-33 bg-disabled',
        thumb: 'bg-neutral-50 text-neutral-17'
      }
    }
  ],
  defaultVariants: {
    color: 'neutral',
    disabled: false,
    labelPosition: 'right',
    size: 'medium'
  }
})

type ToggleVariants = VariantProps<typeof toggle>

export type ToggleProps = Pick<
  ToggleVariants,
  'color' | 'labelPosition' | 'size'
> & {
  checked?: boolean
  defaultChecked?: boolean
  /** invariant: a returned Promise keeps the previous state until it
   * resolves; a rejection leaves the state untouched. */
  onCheckedChange?: (next: boolean) => void | Promise<unknown>
  label?: ReactNode
  description?: ReactNode
  /** Shows "Ligado" / "Desligado" next to the track. */
  showStateText?: boolean
  loading?: boolean
  disabled?: boolean
  id?: string
  className?: string
}

export const Toggle = ({
  checked,
  className,
  color = 'neutral',
  defaultChecked = false,
  description,
  disabled = false,
  id,
  label,
  labelPosition = 'right',
  loading = false,
  onCheckedChange,
  showStateText = false,
  size = 'medium'
}: ToggleProps) => {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const labelId = `${switchId}-label`
  const descriptionId = `${switchId}-description`
  const [uncontrolledOn, setUncontrolledOn] = useState(defaultChecked)
  const [pending, setPending] = useState(false)
  const isOn = checked ?? uncontrolledOn
  const busy = loading || pending
  const slots = toggle({ busy, color, disabled, labelPosition, on: isOn, size })
  const glyph = GLYPH_BY_SIZE[size]

  const commit = (next: boolean) => {
    if (checked === undefined) setUncontrolledOn(next)
  }

  const handleClick = () => {
    if (disabled || busy) return
    const next = !isOn
    const result = onCheckedChange?.(next)
    if (!(result instanceof Promise)) {
      commit(next)
      return
    }
    setPending(true)
    result
      .then(
        () => commit(next),
        () => undefined
      )
      .finally(() => setPending(false))
  }

  const text = (label != null || description != null) && (
    <span className={slots.text()}>
      {label != null && (
        <label className={slots.label()} htmlFor={switchId} id={labelId}>
          {label}
        </label>
      )}
      {description != null && (
        <span className={slots.description()} id={descriptionId}>
          {description}
        </span>
      )}
    </span>
  )

  return (
    <div className={twMerge(slots.row(), className)}>
      {labelPosition === 'left' && text}
      <button
        aria-busy={busy || undefined}
        aria-checked={isOn}
        aria-describedby={description != null ? descriptionId : undefined}
        aria-labelledby={label != null ? labelId : undefined}
        className={twMerge('group/track', slots.track())}
        disabled={disabled}
        id={switchId}
        onClick={handleClick}
        role="switch"
        type="button"
      >
        <span className={slots.thumb()}>
          {busy ? (
            <Spinner
              className={
                size === 'small'
                  ? 'size-2'
                  : size === 'medium'
                    ? 'size-3'
                    : 'size-5'
              }
            />
          ) : (
            isOn && (
              <Icon
                className={twMerge('text-current', glyph.className)}
                name="check"
                size={glyph.size}
                weight={700}
              />
            )
          )}
        </span>
      </button>
      {showStateText && (
        <span aria-hidden className={slots.stateText()}>
          {isOn ? 'Ligado' : 'Desligado'}
        </span>
      )}
      {labelPosition === 'right' && text}
      <span className="sr-only" role="status">
        {busy ? 'Salvando…' : ''}
      </span>
    </div>
  )
}
