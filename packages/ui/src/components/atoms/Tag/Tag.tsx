import { ReactElement } from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'
import { ComponentWithIconProps, IconProps } from '../Icon'
import { getClonedResizedIcons } from '../../utils/getClonedIcons'

export const tag = tv({
  base: 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap align-middle font-medium',
  variants: {
    color: {
      neutral: 'bg-neutral-alpha/10 text-neutral-100',
      red: 'bg-red-alpha/10 text-red-100',
      orange: 'bg-orange-alpha/10 text-orange-100',
      yellow: 'bg-yellow-alpha/10 text-yellow-100',
      lime: 'bg-lime-alpha/10 text-lime-100',
      green: 'bg-green-alpha/10 text-green-100',
      cyan: 'bg-cyan-alpha/10 text-cyan-100',
      blue: 'bg-blue-alpha/10 text-blue-100',
      indigo: 'bg-indigo-alpha/10 text-indigo-100',
      purple: 'bg-purple-alpha/10 text-purple-100',
      pink: 'bg-pink-alpha/10 text-pink-100'
    },
    size: {
      large: 'h-8 py-1 px-1.5 rounded-10 text-size-75',
      medium: 'h-6 py-1 px-1.5 rounded-lg text-size-50',
      small: 'h-5 py-0.5 px-1 rounded-md text-size-25'
    }
  },
  defaultVariants: {
    color: 'blue',
    size: 'small'
  }
})

type TagSize = NonNullable<VariantProps<typeof tag>['size']>

// why: Lamb tags use 14/16/20px glyphs; 14 has no named `Icon` size, so the
// small tag overrides the xSmall glyph with the 14px token.
const ICON_BY_SIZE = {
  small: { size: 'xSmall', className: 'text-current text-icon-14!' },
  medium: { size: 'small', className: 'text-current' },
  large: { size: 'medium', className: 'text-current' }
} as const

export const getTagIcons = (
  icons: (ReactElement<IconProps> | undefined)[],
  size: TagSize = 'small'
) => getClonedResizedIcons({ icons, ...ICON_BY_SIZE[size] })

export type TagProps = ComponentWithIconProps<'span'> & VariantProps<typeof tag>

export const Tag = ({
  children,
  className,
  color,
  endIcon,
  size,
  startIcon,
  ...props
}: TagProps) => {
  const [startIconClone, endIconClone] = getTagIcons([startIcon, endIcon], size)

  return (
    <span className={tag({ className, color, size })} {...props}>
      {startIconClone}
      {children}
      {endIconClone}
    </span>
  )
}
