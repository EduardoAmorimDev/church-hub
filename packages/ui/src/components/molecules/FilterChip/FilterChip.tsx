import { Chip } from '@church/ui/atoms/Chip'
import { Icon, IconName } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'

// why: each button carries its own `::after` 6px above and below, so the
// 32px chip keeps a 44px hit area on both targets without growing.
const HIT_AREA = 'relative after:absolute after:inset-x-0 after:-inset-y-1.5'

const filterChip = tv({
  slots: {
    root: [
      'inline-flex h-8 items-stretch rounded-lg border whitespace-nowrap',
      'text-size-50 font-medium'
    ],
    body: 'inline-flex items-center gap-1 rounded-l-lg pr-1 pl-3',
    label: 'font-normal',
    value: 'font-semibold',
    remove: [
      HIT_AREA,
      'inline-flex w-8 items-center justify-center rounded-r-lg',
      'not-disabled:hover:bg-selected not-disabled:active:bg-neutral-alpha/40'
    ]
  },
  variants: {
    editable: {
      true: { body: [HIT_AREA, 'not-disabled:hover:bg-selected'] }
    },
    disabled: {
      true: {
        root: 'border-default bg-transparent text-disabled',
        label: 'text-disabled'
      },
      false: {
        root: 'border-neutral-999 bg-hover text-primary',
        label: 'text-secondary'
      }
    }
  },
  defaultVariants: { disabled: false, editable: false }
})

export type FilterChipProps = {
  label: string
  value?: string
  /** invariant: read only by the toggle form, as `aria-pressed`. */
  selected?: boolean
  onRemove?: () => void
  onClick?: () => void
  iconName?: IconName
  disabled?: boolean
  /** invariant: omitted, `onRemove` picks `removable`; otherwise `toggle`. */
  variant?: 'removable' | 'toggle'
  className?: string
}

export const FilterChip = ({
  className,
  disabled = false,
  iconName,
  label,
  onClick,
  onRemove,
  selected,
  value,
  variant
}: FilterChipProps) => {
  const form = variant ?? (onRemove ? 'removable' : 'toggle')
  const editable = onClick !== undefined
  const slots = filterChip({ disabled, editable })
  const text =
    value != null ? (
      <>
        <span className={slots.label()}>{label}:</span>{' '}
        <span className={slots.value()}>{value}</span>
      </>
    ) : (
      label
    )

  if (form === 'toggle') {
    const startName = selected ? 'check' : iconName

    return (
      <Chip
        className={className}
        disabled={disabled}
        onClick={onClick}
        selected={Boolean(selected)}
        startIcon={startName ? <Icon name={startName} /> : undefined}
      >
        {text}
      </Chip>
    )
  }

  const full = value != null ? `${label}: ${value}` : label
  const icon = iconName && (
    <Icon className="text-current" name={iconName} size="small" />
  )

  return (
    <span className={slots.root({ className })}>
      {editable ? (
        <button
          aria-label={`Editar filtro ${full}`}
          className={slots.body()}
          disabled={disabled}
          onClick={onClick}
          type="button"
        >
          {icon}
          <span>{text}</span>
        </button>
      ) : (
        <span className={slots.body()}>
          {icon}
          <span>{text}</span>
        </span>
      )}
      <button
        aria-label={`Remover filtro ${full}`}
        className={slots.remove()}
        disabled={disabled}
        onClick={onRemove}
        type="button"
      >
        <Icon className="text-current" name="close" size="small" />
      </button>
    </span>
  )
}
