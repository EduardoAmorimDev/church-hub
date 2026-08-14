'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FocusEvent, MouseEvent, useEffect, useId, useState } from 'react'
import { tv } from '@church/ui/lib/tailwind-variants'
import { Icon } from '@church/ui/atoms/Icon'
import { NavItemProps } from './NavItem.types'

// why: Lamb sizes the web item 32px from `lg` (desktop menu) and 48px below
// it (menu drawer); the mobile values are the base, desktop the override.
const ITEM_BOX = [
  'min-h-12 rounded-xl py-3 text-size-75',
  'lg:min-h-8 lg:rounded-lg lg:py-1.5 lg:text-size-50',
  'font-medium transition-colors duration-300 ease-out'
]

const nav = tv({
  slots: {
    root: 'relative flex list-none flex-col',
    button: [
      ...ITEM_BOX,
      'flex w-full items-center gap-2 px-3.5 text-start lg:px-2.5'
    ],
    icon: 'text-current',
    label: 'min-w-0 flex-1 truncate',
    arrow: 'ml-auto text-current transition-transform duration-200 ease-out',
    inlineList: 'mt-1 flex w-full flex-col gap-1 overflow-hidden',
    subItem: 'list-none',
    subButton: [
      ...ITEM_BOX,
      'relative flex w-full items-center pr-3.5 pl-9.5 text-start lg:pr-2.5',
      'before:absolute before:top-1/2 before:left-4.75 before:size-1',
      'before:-translate-y-1/2 before:rounded-full before:bg-current'
    ],
    popupList:
      'border-neutral-17 absolute rounded-xl border lg:rounded-lg ml-5 lg:ml-0 shadow-xl',
    popupItem:
      'hover:text-neutral-999 text-neutral-83 z-10 flex-1 list-none transition-all hover:translate-x-0.5',
    popupButton:
      'text-size-75 lg:text-size-50 w-full px-5 py-2.5 text-start whitespace-nowrap lg:px-2.5'
  },
  variants: {
    collapsed: {
      true: {
        root: 'w-8',
        button: 'min-h-8 w-8 justify-center p-1.5 lg:p-1.5'
      },
      false: {
        root: 'w-50'
      }
    },
    tone: {
      idle: {
        button: 'text-secondary hover:bg-hover hover:text-primary'
      },
      selected: {
        button: 'text-primary hover:bg-hover'
      },
      current: {
        button: 'bg-selected text-primary'
      }
    },
    subActivated: {
      true: { subButton: 'bg-selected text-primary' },
      false: {
        subButton: 'text-secondary hover:bg-hover hover:text-primary'
      }
    }
  },
  defaultVariants: {
    collapsed: false,
    subActivated: false,
    tone: 'idle'
  }
})

export const NavItem = ({
  activated = false,
  collapsed = false,
  label,
  className,
  iconName,
  onClick,
  selected = false,
  subItems = [],
  ...props
}: NavItemProps) => {
  // why: `motion` animates in JS, which the CSS reduced-motion rule in
  // styles.css cannot reach, so the preference zeroes its duration here.
  const reduceMotion = useReducedMotion()
  const transition = { duration: reduceMotion ? 0 : 0.3 }
  const listId = useId()
  const hasSubItems = subItems.length > 0
  const subItemActive = subItems.some(subItem => subItem.activated)
  const [expanded, setExpanded] = useState(subItemActive)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (subItemActive) setExpanded(true)
  }, [subItemActive])

  useEffect(() => {
    setShowPopup(false)
  }, [collapsed])

  // invariant: losing focus never changes activated/selected; it only closes
  // the collapsed pop-up once focus leaves the whole item.
  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setShowPopup(false)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!hasSubItems) return
    if (collapsed) setShowPopup(prev => !prev)
    else setExpanded(prev => !prev)
  }

  const isSelected = selected || subItemActive
  const tone = activated ? 'current' : isSelected ? 'selected' : 'idle'
  const slots = nav({ collapsed, tone })
  const isOpen = collapsed ? showPopup : expanded

  return (
    <li className={slots.root()} onBlur={handleBlur}>
      <button
        type="button"
        {...props}
        data-name="NavItem"
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        aria-current={activated ? 'page' : undefined}
        aria-expanded={hasSubItems ? isOpen : undefined}
        aria-controls={hasSubItems ? listId : undefined}
        className={slots.button({ className })}
        onClick={handleClick}
      >
        <Icon
          name={iconName}
          fill={activated || isSelected ? 1 : 0}
          size={collapsed ? 'medium' : 'large'}
          className={slots.icon({
            className: collapsed ? undefined : 'lg:text-icon-20!'
          })}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={transition}
              className={slots.label()}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {hasSubItems && !collapsed && (
          <Icon
            name="keyboard_arrow_down"
            size="medium"
            className={slots.arrow({
              className: expanded ? 'rotate-180' : 'rotate-0'
            })}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasSubItems && !collapsed && expanded && (
          <motion.ul
            key="subitems-inline"
            id={listId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className={slots.inlineList()}
          >
            {subItems.map(
              (
                {
                  activated: subActivated,
                  className: subClassName,
                  label: subLabel,
                  ...subItem
                },
                index
              ) => (
                <li key={index} className={slots.subItem()}>
                  <button
                    type="button"
                    aria-current={subActivated ? 'page' : undefined}
                    {...subItem}
                    className={slots.subButton({
                      className: subClassName,
                      subActivated: Boolean(subActivated)
                    })}
                  >
                    {subLabel}
                  </button>
                </li>
              )
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasSubItems && collapsed && showPopup && (
          <motion.ul
            key="subitems-popup"
            id={listId}
            initial={{ opacity: 0, left: 0 }}
            animate={{ opacity: 1, left: 40 }}
            exit={{ opacity: 0, left: 0 }}
            transition={transition}
            className={slots.popupList()}
          >
            {subItems.map(
              (
                { activated: subActivated, label: subLabel, ...subItem },
                index
              ) => (
                <li key={index} className={slots.popupItem()}>
                  <button
                    type="button"
                    aria-current={subActivated ? 'page' : undefined}
                    className={slots.popupButton()}
                    {...subItem}
                    onClick={event => {
                      setShowPopup(false)
                      subItem.onClick?.(event)
                    }}
                  >
                    {subLabel}
                  </button>
                </li>
              )
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
