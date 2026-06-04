import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Icon } from '~/components/atoms/Icon'
import { NavItemProps } from './NavItem.types'

const nav = tv({
  slots: {
    root: 'group relative flex list-none items-start transition-all duration-300 ease-out',
    button: 'flex w-full items-center gap-2 rounded-xl lg:rounded-lg',
    label: 'text-size-75 lg:text-size-50 group-hover:text-neutral-999',
    arrow: 'ml-auto transition-all group-hover:text-neutral-999',
    inlineList: [
      'before:border-l-neutral-alpha/20 w-full',
      'before:absolute before:left-5 before:h-full before:border-l',
      'relative flex flex-col gap-1 overflow-hidden [&>*:first-child]:mt-1'
    ],
    subItem: [
      'before:absolute before:h-1.25 before:w-1.25 before:rounded-full',
      'before:left-4.5 before:top-1/2 before:-translate-y-1/2',
      'hover:text-neutral-999 z-10 flex-1 list-none rounded-xl',
      'relative whitespace-nowrap transition-all lg:rounded-lg'
    ],
    subButton:
      'text-size-75 lg:text-size-50 w-full py-3 pr-3.5 pl-11 text-start lg:py-1.5 lg:pr-2.5 lg:pl-8',
    popupList:
      'border-neutral-17 absolute rounded-xl border lg:rounded-lg ml-5 lg:ml-0',
    popupItem:
      'hover:text-neutral-999 text-neutral-83 z-10 flex-1 list-none transition-all duration-300 hover:translate-x-0.5',
    popupButton:
      'text-size-75 lg:text-size-50 w-full px-5 py-2.5 text-start whitespace-nowrap lg:px-2.5'
  },
  variants: {
    collapsed: {
      true: {
        root: 'w-12 flex-row gap-2 lg:w-8',
        button: 'p-3 lg:p-1.5'
      },
      false: {
        root: 'w-50 flex-col',
        button: 'px-3.5 py-3 lg:px-2.5 lg:py-1.5'
      }
    },
    active: {
      true: {
        root: 'text-neutral-100',
        button: 'bg-neutral-alpha/20',
        label: '',
        arrow: '-rotate-180'
      },
      false: {
        button: 'hover:bg-neutral-alpha/20',
        label: 'text-neutral-83',
        arrow: 'text-neutral-67'
      }
    },
    activated: {
      true: {
        subItem: 'bg-neutral-alpha/20 text-neutral-100 before:bg-neutral-83'
      },
      false: {
        subItem: 'hover:bg-neutral-alpha/20'
      }
    }
  }
})

export const NavItem = ({
  activated = false,
  collapsed = false,
  label,
  className,
  iconName,
  subItems = [],
  ...props
}: NavItemProps) => {
  const [active, setActive] = useState(activated)
  const [showSubItems, setShowSubItems] = useState(false)

  const [hasSubItems, subItemActive] = useMemo(
    () => [subItems.length > 0, subItems.some(subItem => subItem.activated)],
    [subItems]
  )

  useEffect(() => {
    setActive(activated || subItemActive)
    setShowSubItems(false)
  }, [activated, collapsed, subItems, subItemActive])

  const handleBlur = useCallback(() => {
    if (!subItemActive) setActive(!collapsed)
    setShowSubItems(false)
  }, [collapsed, subItemActive])

  const handleClick = useCallback(() => {
    if (!hasSubItems) return

    if (collapsed) {
      if (active && !showSubItems) {
        setShowSubItems(true)
        return
      }

      setShowSubItems(prev => !prev)
      setActive(prev => subItemActive || !prev)
      return
    }

    setActive(prev => !prev)
  }, [hasSubItems, collapsed, active, showSubItems, subItemActive])

  const slots = nav({ collapsed, active })

  return (
    <li className={slots.root()} onBlur={handleBlur}>
      <button
        type="button"
        data-name="NavItem"
        className={slots.button({ className })}
        onClick={hasSubItems ? handleClick : undefined}
        {...props}
      >
        <Icon
          name={iconName}
          responsive
          fill={active ? 1 : 0}
          size="large"
          className={
            active ? '' : 'text-neutral-50 group-hover:text-neutral-100'
          }
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className={slots.label()}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {hasSubItems && !collapsed && (
          <Icon
            name="keyboard_arrow_down"
            responsive
            size="large"
            className={slots.arrow()}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasSubItems && !collapsed && active && (
          <motion.ul
            key="subitems-inline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={slots.inlineList()}
          >
            {subItems.map((subItem, index) => (
              <li
                key={index}
                className={slots.subItem({ activated: subItem.activated })}
              >
                <button
                  className={slots.subButton({ className: subItem.className })}
                  {...subItem}
                >
                  {subItem.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasSubItems && collapsed && showSubItems && (
          <motion.ul
            key="subitems-popup"
            initial={{ opacity: 0, left: 0 }}
            animate={{ opacity: 1, left: 40 }}
            exit={{ opacity: 0, left: 0 }}
            transition={{ duration: 0.3 }}
            className={slots.popupList()}
          >
            {subItems.map((subItem, index) => (
              <li key={index} className={slots.popupItem()}>
                <button
                  className={slots.popupButton()}
                  {...subItem}
                  onClick={e => {
                    setShowSubItems(false)
                    subItem.onClick?.(e)
                  }}
                >
                  {subItem.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
