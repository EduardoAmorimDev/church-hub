import { cloneElement, ReactElement } from 'react'
import { IconProps } from '../atoms/Icon'
import { Size } from '@church/ui/models'

type SizeStep = 'forward' | 'backward'

type GetClonedIconsParams = {
  disabled?: boolean
  icons: (ReactElement | undefined)[]
  size?: Size
  sizeStep?: SizeStep
}
const iconSizesMap: Record<SizeStep, Partial<Record<Size, Size>>> = {
  forward: {
    xSmall: 'small',
    small: 'medium',
    medium: 'large',
    large: 'xLarge'
  },
  backward: {
    small: 'xSmall',
    medium: 'small',
    large: 'medium',
    xLarge: 'large'
  }
}

export const getClonedResizedIcons = ({
  disabled,
  icons,
  size = 'medium',
  sizeStep
}: GetClonedIconsParams) => {
  return icons?.map(icon => {
    if (!icon) return null
    const isIcon =
      typeof (icon.props as IconProps | undefined)?.name === 'string'
    // Only size-adjust Icon glyphs; pass interactive elements (buttons, etc.)
    // through untouched so they keep their own layout.
    return isIcon
      ? cloneElement(icon, {
          size: sizeStep ? iconSizesMap[sizeStep][size] : size,
          disabled
        } as Partial<IconProps>)
      : icon
  })
}
