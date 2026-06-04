import { IconProps } from '~/components/atoms/Icon'

type ButtonProps = Omit<React.ComponentProps<'button'>, 'children'>

type ButtonWithoutMouseEventsProps = {
  [K in keyof ButtonProps as K extends `onMouse${string}`
    ? never
    : K]: ButtonProps[K]
}

type NavigationChildProps = {
  label: string
  activated?: boolean
}

type NavigationItemWithSubItemsProps = ButtonWithoutMouseEventsProps &
  NavigationChildProps & {
    subItems: (NavigationChildProps & ButtonProps)[]
  }

type NavigationItemWithoutSubItemsProps = ButtonProps &
  NavigationChildProps & {
    subItems?: never
  }

export type NavItemProps = (
  | NavigationItemWithSubItemsProps
  | NavigationItemWithoutSubItemsProps
) & {
  iconName: IconProps['name']
  collapsed?: boolean
}

export type NavSubItemProps = NavigationChildProps & ButtonProps
