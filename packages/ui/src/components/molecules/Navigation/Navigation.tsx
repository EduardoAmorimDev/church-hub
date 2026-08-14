import React from 'react'
import { NavItem } from '@church/ui/atoms/NavItem'
import { NavItemProps } from '@church/ui/atoms/NavItem'

export type NavigationProps = Pick<NavItemProps, 'collapsed'> & {
  items: NavItemProps[]
  'aria-label'?: string
}

export const Navigation: React.FC<NavigationProps> = ({
  'aria-label': ariaLabel = 'Navegação principal',
  collapsed = false,
  items
}) => {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <NavItem key={index} {...item} collapsed={collapsed} />
        ))}
      </ul>
    </nav>
  )
}
