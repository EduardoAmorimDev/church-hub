'use client'

import {
  cloneElement,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'
import { MenuItem, MenuItemProps } from './components'
import { tv } from '@church/ui/lib/tailwind-variants'

const menuDropdown = tv({
  slots: {
    anchor: 'relative inline-flex',
    menu: [
      'absolute top-full z-30 mt-1 flex min-w-45 flex-col p-2',
      'rounded-2xl border border-default bg-surface shadow-elevation-low-bottom-12'
    ]
  },
  variants: {
    align: {
      start: { menu: 'left-0' },
      end: { menu: 'right-0' }
    }
  },
  defaultVariants: { align: 'start' }
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
  /** invariant: names the `role="menu"`; without it the menu is unnamed. */
  label?: string
}

const ENABLED_ITEM = '[role="menuitem"]:not(:disabled)'

export const MenuDropdown = ({
  align = 'start',
  items,
  label,
  trigger
}: MenuDropdownProps) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const slots = menuDropdown({ align })

  const focusTrigger = () =>
    anchorRef.current
      ?.querySelector<HTMLElement>('[aria-haspopup="menu"]')
      ?.focus()

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
