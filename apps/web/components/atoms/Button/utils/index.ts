import { cloneElement } from 'react'
import { IconElement } from '../../Icon'
import { iconSizes } from '../data'

export const getClonedIcon = (
  icon?: IconElement,
  size?: keyof typeof iconSizes
) => {
  return icon ? cloneElement(icon, { size: iconSizes[size || 'medium'] }) : null
}
