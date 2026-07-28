import { cloneElement, ReactElement } from 'react'
import { IconProps } from '../atoms/Icon'
import { Size } from '~/models'

export const getClonedIcons = ({
  endIcon,
  startIcon,
  size
}: {
  endIcon?: ReactElement<IconProps>
  startIcon?: ReactElement<IconProps>
  size?: Extract<Size, 'small' | 'medium' | 'large'>
}) => {
  return {
    endIcon: endIcon
      ? cloneElement(endIcon, {
          size
        })
      : null,
    startIcon: startIcon
      ? cloneElement(startIcon, {
          size
        })
      : null
  }
}
