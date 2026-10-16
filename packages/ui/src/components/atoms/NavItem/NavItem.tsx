'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import {
  CSSProperties,
  FocusEvent,
  MouseEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { tv } from '@church/ui/lib/tailwind-variants'
import { CountBadge } from '@church/ui/atoms/CountBadge'
import { Icon } from '@church/ui/atoms/Icon'
import { NavItemProps, NavSubItemProps } from './NavItem.types'

// why: Lamb sizes the web item 32px in Painel (from 960px, the SideMenu) and
// 48px in App (the MenuDrawer); App is the base, and `panel:` or an ancestor
// `[data-viewport]` switches it (Stack `auto` pattern).
const ITEM_BOX = [
  'min-h-12 rounded-xl py-3 text-size-75',
  'panel:not-in-data-[viewport=mobile]:min-h-8 panel:not-in-data-[viewport=mobile]:rounded-lg panel:not-in-data-[viewport=mobile]:py-1.5 panel:not-in-data-[viewport=mobile]:text-size-50',
  'in-data-[viewport=desktop]:min-h-8 in-data-[viewport=desktop]:rounded-lg in-data-[viewport=desktop]:py-1.5 in-data-[viewport=desktop]:text-size-50',
  'font-medium transition-colors duration-300 ease-out'
]

const ICON_PANEL =
  'panel:not-in-data-[viewport=mobile]:text-icon-20! in-data-[viewport=desktop]:text-icon-20!'

const nav = tv({
  slots: {
    root: 'relative flex list-none flex-col',
    button: [
      ...ITEM_BOX,
      'flex w-full items-center gap-2 px-3.5 text-start',
      'panel:not-in-data-[viewport=mobile]:px-2.5 in-data-[viewport=desktop]:px-2.5'
    ],
    icon: 'text-current',
    label: 'min-w-0 flex-1 truncate',
    arrow: 'ml-auto text-current transition-transform duration-200 ease-out',
    // why: `282:37325` draws a 1px guide line from under the parent to the last sub-item; `pt-1` keeps that gap inside the line.
    inlineList: [
      'relative flex w-full flex-col gap-1 overflow-hidden pt-1',
      'before:absolute before:inset-y-0 before:left-4.75 before:w-px before:bg-neutral-17'
    ],
    subItem: 'list-none',
    subButton: [
      ...ITEM_BOX,
      'relative flex w-full items-center pr-3.5 pl-9.5 text-start',
      'panel:not-in-data-[viewport=mobile]:pr-2.5 in-data-[viewport=desktop]:pr-2.5'
    ],
    // why: `fixed` escapes the SideMenu's `overflow-y-auto`, which clipped an
    // `absolute` pop-up; it stays inside the `li` so `handleBlur` still works.
    popupList: [
      'border-neutral-17 bg-surface fixed z-30 ml-5 rounded-xl border shadow-xl',
      'panel:not-in-data-[viewport=mobile]:ml-0 panel:not-in-data-[viewport=mobile]:rounded-lg',
      'in-data-[viewport=desktop]:ml-0 in-data-[viewport=desktop]:rounded-lg'
    ],
    popupItem:
      'hover:text-neutral-999 text-neutral-83 z-10 flex-1 list-none transition-all hover:translate-x-0.5',
    popupButton: [
      'text-size-75 block w-full px-5 py-2.5 text-start whitespace-nowrap',
      'panel:not-in-data-[viewport=mobile]:text-size-50 panel:not-in-data-[viewport=mobile]:px-2.5',
      'in-data-[viewport=desktop]:text-size-50 in-data-[viewport=desktop]:px-2.5'
    ]
  },
  variants: {
    collapsed: {
      true: {
        root: 'w-8',
        button: [
          'min-h-8 w-8 justify-center p-1.5',
          'panel:not-in-data-[viewport=mobile]:p-1.5 in-data-[viewport=desktop]:p-1.5'
        ]
      },
      false: {
        root: 'w-full'
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
      },
      // why: collapsed, the active sub-item is hidden, so its parent takes
      // the background instead (Lamb `data-branch`).
      branch: {
        button: 'bg-selected text-primary'
      }
    },
    // why: Lamb Nav sub-item (`13506:10602`) shows the dot only on the
    // current sub-item.
    subActivated: {
      true: {
        subButton: [
          'bg-selected text-primary',
          'before:absolute before:top-1/2 before:left-4.75 before:size-1',
          'before:-translate-y-1/2 before:rounded-full before:bg-current'
        ]
      },
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

type SubItemLinkProps = {
  item: NavSubItemProps
  className: string
  onActivate?: () => void
}

const SubItemLink = ({ className, item, onActivate }: SubItemLinkProps) => {
  const { activated, className: itemClassName, label, ...element } = item
  const shared = {
    'aria-current': activated ? ('page' as const) : undefined,
    className: [className, itemClassName].filter(Boolean).join(' '),
    onClick: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      onActivate?.()
      element.onClick?.(event)
    }
  }

  if (element.href === undefined)
    return (
      <button type="button" {...element} {...shared}>
        {label}
      </button>
    )

  return (
    <Link {...element} {...shared}>
      {label}
    </Link>
  )
}

export const NavItem = ({
  activated = false,
  collapsed = false,
  count,
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
  const [popupPosition, setPopupPosition] = useState<CSSProperties>()
  const rootRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (subItemActive) setExpanded(true)
  }, [subItemActive])

  useEffect(() => {
    setShowPopup(false)
  }, [collapsed])

  // invariant: the pop-up starts at the item's top-left corner, where the
  // `absolute` pop-up sat, and follows it on any scroll or resize.
  useLayoutEffect(() => {
    if (!showPopup) return
    const place = () => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (rect) setPopupPosition({ top: rect.top, left: rect.left })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [showPopup])

  // invariant: losing focus never changes activated/selected; it only closes
  // the collapsed pop-up once focus leaves the whole item.
  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setShowPopup(false)
  }

  const handleClick = (
    event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    onClick?.(event)
    if (!hasSubItems) return
    if (collapsed) setShowPopup(prev => !prev)
    else setExpanded(prev => !prev)
  }

  const isSelected = selected || subItemActive
  const tone = activated
    ? 'current'
    : collapsed && subItemActive
      ? 'branch'
      : isSelected
        ? 'selected'
        : 'idle'
  const slots = nav({ collapsed, tone })
  const isOpen = collapsed ? showPopup : expanded

  const shared = {
    'data-name': 'NavItem',
    'aria-label': collapsed ? label : undefined,
    title: collapsed ? label : undefined,
    'aria-current': activated ? ('page' as const) : undefined,
    className: slots.button({ className }),
    onClick: handleClick
  }
  const branchState = {
    'aria-expanded': hasSubItems ? isOpen : undefined,
    'aria-controls': hasSubItems ? listId : undefined
  }

  const content = (
    <>
      <Icon
        name={iconName}
        fill={activated || isSelected ? 1 : 0}
        size={collapsed ? 'medium' : 'large'}
        className={slots.icon({
          className: collapsed ? undefined : ICON_PANEL
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

      {!collapsed && count !== undefined && count > 0 && (
        <CountBadge className="shrink-0" count={count} />
      )}

      {hasSubItems && !collapsed && (
        <Icon
          name="keyboard_arrow_down"
          size="medium"
          className={slots.arrow({
            className: expanded ? 'rotate-180' : 'rotate-0'
          })}
        />
      )}
    </>
  )

  // invariant: a parent with sub-items stays a button even when an untyped
  // caller passes `href`; only a leaf becomes the Next link.
  const item =
    props.href === undefined ? (
      <button type="button" {...props} {...shared} {...branchState}>
        {content}
      </button>
    ) : hasSubItems ? (
      <button type="button" {...shared} {...branchState}>
        {content}
      </button>
    ) : (
      <Link {...props} {...shared}>
        {content}
      </Link>
    )

  return (
    <li ref={rootRef} className={slots.root()} onBlur={handleBlur}>
      {item}

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
            {subItems.map((subItem, index) => (
              <li key={index} className={slots.subItem()}>
                <SubItemLink
                  item={subItem}
                  className={slots.subButton({
                    subActivated: Boolean(subItem.activated)
                  })}
                />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasSubItems && collapsed && showPopup && (
          <motion.ul
            key="subitems-popup"
            id={listId}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 40 }}
            exit={{ opacity: 0, x: 0 }}
            transition={transition}
            style={popupPosition}
            className={slots.popupList()}
          >
            {subItems.map((subItem, index) => (
              <li key={index} className={slots.popupItem()}>
                <SubItemLink
                  item={subItem}
                  className={slots.popupButton()}
                  onActivate={() => setShowPopup(false)}
                />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
