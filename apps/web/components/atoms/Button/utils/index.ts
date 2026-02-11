import { cloneElement } from 'react'
import { iconSizes } from '../data'
import { IconElement } from '../../Icon'

export const getClonedIcon = (
  icon?: IconElement,
  size?: keyof typeof iconSizes
) => {
  return icon ? cloneElement(icon, { size: iconSizes[size || 'medium'] }) : null
}
