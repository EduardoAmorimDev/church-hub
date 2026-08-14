import type { LinkProps } from 'next/link'
import type { ComponentProps, MouseEventHandler } from 'react'
import { IconProps } from '@church/ui/atoms/Icon'

type ButtonProps = Omit<ComponentProps<'button'>, 'children' | 'onClick'>

type AnchorProps = Omit<ComponentProps<'a'>, 'children' | 'href' | 'onClick'>

type ButtonWithoutMouseEventsProps = {
  [K in keyof ButtonProps as K extends `onMouse${string}`
    ? never
    : K]: ButtonProps[K]
}

/** invariant: one handler type for both elements, so a consumer can wrap
 * `onClick` without knowing whether the item renders a button or a link. */
export type NavClickHandler = MouseEventHandler<
  HTMLButtonElement | HTMLAnchorElement
>

type NavigationChildProps = {
  label: string
  activated?: boolean
  onClick?: NavClickHandler
}

/** why: without `href` the item is a `<button>`; with it, the `Link` of
 * `next/link`, so it takes anchor attributes instead (Decided 4). */
type NavElementProps =
  | (ButtonProps & { href?: undefined })
  | (AnchorProps & { href: LinkProps['href'] })

export type NavSubItemProps = NavigationChildProps & NavElementProps

type NavigationItemWithSubItemsProps = ButtonWithoutMouseEventsProps &
  NavigationChildProps & {
    subItems: NavSubItemProps[]
    /** invariant: a parent only expands its sub-list; it never navigates. */
    href?: never
  }

type NavigationItemWithoutSubItemsProps = NavigationChildProps &
  NavElementProps & {
    subItems?: never
  }

export type NavItemProps = (
  | NavigationItemWithSubItemsProps
  | NavigationItemWithoutSubItemsProps
) & {
  iconName: IconProps['name']
  collapsed?: boolean
  /** invariant: shown as a CountBadge after the label when above 0 and not
   * collapsed. */
  count?: number
  /** invariant: on the trail of the current page (Lamb `selected`): filled
   * icon and primary text, without the current-page background. */
  selected?: boolean
}
