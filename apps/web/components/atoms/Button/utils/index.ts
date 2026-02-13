import { Children, cloneElement, isValidElement, ReactNode } from 'react'
import { Icon } from '../../Icon'

export const renderButtonChildren = (
  children: ReactNode,
  size: number
): ReactNode => {
  return Children.map(children, child => {
    if (!isValidElement(child)) {
      return child
    }

    if (child.type === Icon) {
      return cloneElement(child, {
        ...child.props,
        size: child.props.size || size
      })
    }

    if (child.props?.children) {
      return cloneElement(child, {
        ...child.props,
        children: renderButtonChildren(child.props.children, size)
      })
    }

    return child
  })
}
