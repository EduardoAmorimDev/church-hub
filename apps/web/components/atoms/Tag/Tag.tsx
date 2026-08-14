import { tv, VariantProps } from '~/lib/tailwind-variants'
import { ComponentWithIconProps } from '../Icon'
import { getClonedResizedIcons } from '../../utils/getClonedIcons'
import React from 'react'

export const tag = tv({
  base: 'font-medium flex items-center gap-1',
  variants: {
    color: {
      neutral: 'bg-neutral-alpha/20 text-neutral-83',
      red: 'bg-red-alpha/20 text-red-67',
      orange: 'bg-orange-alpha/20 text-orange-50',
      yellow: 'bg-yellow-alpha/20 text-yellow-50',
      lime: 'bg-lime-alpha/20 text-lime-50',
      green: 'bg-green-alpha/20 text-green-67',
      cyan: 'bg-cyan-alpha/20 text-cyan-50',
      blue: 'bg-blue-alpha/20 text-blue-67',
      indigo: 'bg-indigo-alpha/20 text-indigo-83',
      purple: 'bg-purple-alpha/20 text-purple-67',
      pink: 'bg-pink-alpha/20 text-pink-67'
    },
    size: {
      large: 'text-size-75 py-1 px-1.5 rounded-[10px]',
      medium: 'text-size-50 py-1 px-1.5 rounded-lg',
      small: 'text-size-25 py-0.5 px-1 rounded-md'
    }
  },
  defaultVariants: {
    color: 'neutral',
    size: 'medium'
  }
})

export type TagProps = ComponentWithIconProps<'div'> & VariantProps<typeof tag>

export const Tag = ({
  children,
  color = 'neutral',
  endIcon,
  size,
  startIcon,
  ...props
}: TagProps) => {
  const [startIconClone, endIconClone] = getClonedResizedIcons({
    icons: [startIcon, endIcon],
    size
  })

  return (
    <div className={tag({ color, size })} {...props}>
      {startIconClone}
      {children}
      {endIconClone}
    </div>
  )
}
