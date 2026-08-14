import React from 'react'
import { NavItem } from '~/components/atoms/NavItem'
import { NavItemProps } from '~/components/atoms/NavItem/NavItem.types'

export type NavigationProps = Pick<NavItemProps, 'collapsed'> & {
  items: NavItemProps[]
}

export const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  items
}) => {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <NavItem key={index} {...item} collapsed={collapsed} />
      ))}
    </div>
  )
}
