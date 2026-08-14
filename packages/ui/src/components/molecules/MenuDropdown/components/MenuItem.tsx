import { Icon, IconName } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'

// why: Lamb paints hover and keyboard focus alike, and `active` (the current
// choice) like the pressed state; a disabled item keeps neither.
const menuItem = tv({
  base: [
    'flex min-h-9 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2',
    'text-left text-size-50 font-medium transition-colors',
    'not-disabled:hover:bg-hover focus-visible:bg-hover not-disabled:active:bg-selected',
    'data-[active=true]:bg-selected disabled:text-disabled'
  ],
  variants: {
    color: {
      neutral: 'text-primary',
      destructive: 'text-danger'
    }
  },
  defaultVariants: { color: 'neutral' }
})

export type MenuItemProps = {
  label: string
  iconName?: IconName
  /** why: `destructive` marks remove/archive actions (Lamb `danger`). */
  color?: 'neutral' | 'destructive'
  disabled?: boolean
  /** invariant: the current choice among the items, painted as selected. */
  active?: boolean
  onSelect?: () => void
}

export const MenuItem = ({
  active = false,
  color = 'neutral',
  disabled = false,
  iconName,
  label,
  onSelect
}: MenuItemProps) => (
  <button
    className={menuItem({ color })}
    data-active={active || undefined}
    disabled={disabled}
    onClick={onSelect}
    role="menuitem"
    tabIndex={-1}
    type="button"
  >
    {iconName && <Icon className="text-current" name={iconName} />}
    <span>{label}</span>
  </button>
)
