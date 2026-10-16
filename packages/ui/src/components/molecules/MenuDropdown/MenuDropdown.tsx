'use client'

import {
  cloneElement,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { MenuItem, MenuItemProps } from './components'
import { tv } from '@church/ui/lib/tailwind-variants'

const menuDropdown = tv({
  slots: {
    anchor: 'relative inline-flex',
    menu: [
      'z-30 flex min-w-45 flex-col p-2',
      'rounded-2xl border border-default bg-surface shadow-elevation-low-bottom-12'
    ]
  },
  variants: {
    align: { start: {}, end: {} },
    side: { bottom: {}, top: {} },
    strategy: {
      absolute: { menu: 'absolute' },
      fixed: { menu: 'fixed' }
    }
  },
  compoundVariants: [
    { strategy: 'absolute', align: 'start', class: { menu: 'left-0' } },
    { strategy: 'absolute', align: 'end', class: { menu: 'right-0' } },
    { strategy: 'absolute', side: 'bottom', class: { menu: 'top-full mt-1' } },
    { strategy: 'absolute', side: 'top', class: { menu: 'bottom-full mb-1' } }
  ],
  defaultVariants: { align: 'start', side: 'bottom', strategy: 'absolute' }
})

// invariant: the 4px gap of `mt-1`/`mb-1`, applied by hand in `fixed`.
const FIXED_GAP = 4

const fixedPosition = (
  trigger: DOMRect,
  align: 'start' | 'end',
  side: 'bottom' | 'top'
): CSSProperties => ({
  ...(side === 'bottom'
    ? { top: trigger.bottom + FIXED_GAP }
    : { bottom: window.innerHeight - trigger.top + FIXED_GAP }),
  ...(align === 'start'
    ? { left: trigger.left }
    : { right: window.innerWidth - trigger.right })
})

type MenuTriggerProps = {
  onClick?: MouseEventHandler<HTMLElement>
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: 'menu'
}

export type MenuDropdownProps = {
  /** invariant: a focusable element (a Button or IconButton) that opens the
   * menu; it receives `aria-haspopup`, `aria-expanded` and `aria-controls`. */
  trigger: ReactElement<MenuTriggerProps>
  items: MenuItemProps[]
  align?: 'start' | 'end'
  side?: 'bottom' | 'top'
  /** invariant: names the `role="menu"`; without it the menu is unnamed. */
  label?: string
  /** why: `fixed` escapes an `overflow` ancestor (a Table row) while the
   * menu stays in the anchor's DOM, so overlays keep their focus trap. */
  strategy?: 'absolute' | 'fixed'
}

const ENABLED_ITEM = '[role="menuitem"]:not(:disabled)'

export const MenuDropdown = ({
  align = 'start',
  items,
  label,
  side = 'bottom',
  strategy = 'absolute',
  trigger
}: MenuDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<CSSProperties>()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const slots = menuDropdown({ align, side, strategy })

  const triggerOf = () =>
    anchorRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')

  const focusTrigger = () => triggerOf()?.focus()

  useLayoutEffect(() => {
    if (!open || strategy !== 'fixed') return
    const place = () => {
      const rect = triggerOf()?.getBoundingClientRect()
      if (rect) setPosition(fixedPosition(rect, align, side))
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [align, open, side, strategy])

  // why: with no enabled item the menu itself takes focus, so Esc still
  // reaches its key handler (task Unresolved 4).
  useEffect(() => {
    if (!open) return
    const first = menuRef.current?.querySelector<HTMLElement>(ENABLED_ITEM)
    ;(first ?? menuRef.current)?.focus()

    const closeOutside = (event: globalThis.MouseEvent) => {
      if (
        event.target instanceof Node &&
        !anchorRef.current?.contains(event.target)
      )
        setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(ENABLED_ITEM) ?? []
    )
    const index = enabled.findIndex(item => item === document.activeElement)
    const step = (delta: number) => {
      if (enabled.length === 0) return
      const from = index === -1 ? (delta > 0 ? -1 : 0) : index
      enabled[(from + delta + enabled.length) % enabled.length]?.focus()
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'Escape') {
      // why: the Esc that closes the menu must not also close the overlay
      // (Dialog, Drawer, BottomSheet) the menu sits in.
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      focusTrigger()
    } else if (event.key === 'Tab') {
      // why: Tab then leaves from the trigger, as if the menu was never open.
      setOpen(false)
      focusTrigger()
    }
  }

  const onTriggerClick = (event: MouseEvent<HTMLElement>) => {
    trigger.props.onClick?.(event)
    setOpen(current => !current)
  }

  return (
    <span className={slots.anchor()} ref={anchorRef}>
      {cloneElement(trigger, {
        'aria-controls': menuId,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        onClick: onTriggerClick
      })}
      {open && (
        <div
          aria-label={label}
          className={slots.menu()}
          id={menuId}
          onKeyDown={onKeyDown}
          ref={menuRef}
          role="menu"
          // why: runtime geometry from the trigger, which no token expresses.
          style={strategy === 'fixed' ? position : undefined}
          tabIndex={-1}
        >
          {items.map((item, index) => (
            <MenuItem
              key={`${item.label}-${index}`}
              {...item}
              onSelect={() => {
                setOpen(false)
                focusTrigger()
                item.onSelect?.()
              }}
            />
          ))}
        </div>
      )}
    </span>
  )
}
