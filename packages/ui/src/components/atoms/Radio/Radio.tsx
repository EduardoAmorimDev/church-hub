import {
  ChangeEvent,
  ComponentProps,
  ElementRef,
  forwardRef,
  ReactNode,
  useId
} from 'react'
import { RADIO_TOUCH_ROW, RADIO_TOUCH_ROW_LARGE } from './data'
import { RadioSize, useRadioGroup } from './Radio.context'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv } from '@church/ui/lib/tailwind-variants'

// invariant: the native input is the visible circle (`appearance-none`), so
// the global focus outline lands on it; the dot overlays it as its peer.
const radio = tv({
  slots: {
    row: 'group flex cursor-pointer items-start gap-2 text-primary',
    box: 'relative inline-flex shrink-0 items-center justify-center',
    control: [
      'peer m-0 shrink-0 cursor-pointer appearance-none rounded-full border-2',
      'border-control bg-surface transition-[background-color,border-color] duration-150 ease-out',
      'checked:border-neutral-999',
      'not-disabled:not-checked:group-hover:border-neutral-83',
      'not-disabled:group-hover:bg-hover not-disabled:group-active:bg-selected',
      'disabled:cursor-not-allowed disabled:border-neutral-33 disabled:bg-disabled'
    ],
    dot: [
      'pointer-events-none absolute scale-0 rounded-full bg-current text-neutral-999',
      'transition-transform duration-150 ease-out',
      'peer-checked:scale-100 peer-disabled:text-disabled'
    ],
    text: 'flex min-w-0 flex-col gap-0.5',
    label: 'font-medium',
    description: 'text-size-50 font-normal text-secondary'
  },
  variants: {
    size: {
      small: {
        box: 'size-4',
        control: 'size-4',
        dot: 'size-2',
        label: 'text-size-50'
      },
      medium: {
        box: 'size-6',
        control: 'size-5',
        dot: 'size-2.5',
        label: 'text-size-75'
      },
      large: {
        box: 'size-8',
        control: 'size-7',
        dot: 'size-3.5',
        label: 'text-size-100 leading-8'
      }
    },
    // why: a card draws the keyboard ring around the whole card (Lamb
    // `:has(:focus-visible)`), so the circle drops its own outline there.
    variant: {
      default: { row: RADIO_TOUCH_ROW },
      card: {
        row: [
          'rounded-xl border border-default bg-surface p-4',
          'transition-[background-color,border-color] duration-150 ease-out',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring'
        ],
        control: 'focus-visible:outline-none',
        description: 'leading-5'
      }
    },
    checked: { true: {}, false: {} },
    invalid: {
      true: {
        control:
          'border-red-67 checked:border-red-67 not-disabled:not-checked:group-hover:border-red-67'
      },
      false: {}
    },
    disabled: {
      true: {
        row: 'cursor-not-allowed text-disabled',
        description: 'text-disabled'
      },
      false: {}
    }
  },
  compoundVariants: [
    {
      variant: 'default',
      size: 'large',
      class: { row: RADIO_TOUCH_ROW_LARGE }
    },
    {
      variant: 'card',
      checked: true,
      disabled: false,
      class: { row: 'border-neutral-999 inset-ring inset-ring-neutral-999' }
    },
    {
      variant: 'card',
      disabled: false,
      class: { row: 'hover:bg-hover active:bg-selected' }
    },
    {
      variant: 'card',
      checked: false,
      disabled: false,
      invalid: false,
      class: { row: 'hover:border-neutral-33' }
    },
    { variant: 'card', invalid: true, class: { row: 'border-red-67' } },
    {
      variant: 'card',
      disabled: true,
      class: { row: 'border-default bg-hover' }
    }
  ],
  defaultVariants: {
    checked: false,
    disabled: false,
    invalid: false,
    size: 'medium',
    variant: 'default'
  }
})

export type RadioProps = Omit<
  ComponentProps<'input'>,
  'children' | 'size' | 'type' | 'value'
> & {
  value: string
  label: ReactNode
  /** invariant: rendered under the label and linked by `aria-describedby`. */
  description?: ReactNode
  /** invariant: inside a RadioGroup, an omitted size follows the group. */
  size?: RadioSize
}

export const Radio = forwardRef<ElementRef<'input'>, RadioProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      checked,
      className,
      defaultChecked,
      description,
      disabled,
      id,
      label,
      name,
      onChange,
      size,
      value,
      ...props
    },
    ref
  ) => {
    const group = useRadioGroup()
    const generatedId = useId()
    const controlId = id ?? generatedId
    const descriptionId = `${controlId}-description`
    const isDisabled = Boolean(disabled || group?.disabled)
    const isChecked = group ? group.value === value : checked
    const slots = radio({
      checked: Boolean(isChecked),
      disabled: isDisabled,
      invalid: group?.invalid ?? false,
      size: size ?? group?.size ?? 'medium',
      variant: group?.variant ?? 'default'
    })
    const describedBy =
      [ariaDescribedBy, description != null ? descriptionId : undefined]
        .filter(Boolean)
        .join(' ') || undefined

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      group?.select(value, event)
      onChange?.(event)
    }

    return (
      <label className={twMerge(slots.row(), className)}>
        <span className={slots.box()}>
          <input
            {...props}
            aria-describedby={describedBy}
            checked={isChecked}
            className={slots.control()}
            defaultChecked={group ? undefined : defaultChecked}
            disabled={isDisabled}
            id={controlId}
            name={group ? group.name : name}
            onChange={handleChange}
            ref={ref}
            type="radio"
            value={value}
          />
          <span aria-hidden className={slots.dot()} />
        </span>
        <span className={slots.text()}>
          <span className={slots.label()}>{label}</span>
          {description != null && (
            <span className={slots.description()} id={descriptionId}>
              {description}
            </span>
          )}
        </span>
      </label>
    )
  }
)
Radio.displayName = 'Radio'
