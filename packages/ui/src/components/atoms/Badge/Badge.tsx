import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'
import { getTagIcons, Tag, tag, TagProps } from '../Tag'

const badge = tv({
  extend: tag,
  variants: {
    color: {
      neutral: 'bg-action-primary text-inverse',
      red: 'bg-red-83 text-on-accent',
      orange: 'bg-orange-83 text-on-accent',
      yellow: 'bg-yellow-83 text-on-accent',
      lime: 'bg-lime-83 text-on-accent',
      green: 'bg-green-83 text-on-accent',
      cyan: 'bg-cyan-83 text-on-accent',
      blue: 'bg-blue-83 text-on-accent',
      indigo: 'bg-indigo-83 text-on-accent',
      purple: 'bg-purple-83 text-on-accent',
      pink: 'bg-pink-83 text-on-accent'
    }
  },
  defaultVariants: {
    color: 'neutral',
    size: 'small'
  }
})

export type BadgeProps = TagProps &
  VariantProps<typeof badge> & {
    variant?: 'low' | 'high'
  }

export const Badge = ({
  color = 'neutral',
  variant = 'low',
  ...props
}: BadgeProps) => {
  if (variant === 'low') return <Tag color={color} {...props} />

  const { children, className, endIcon, startIcon, size, ...rest } = props
  const [clonedStartIcon, clonedEndIcon] = getTagIcons(
    [startIcon, endIcon],
    size
  )

  return (
    <span className={badge({ className, color, size })} {...rest}>
      {clonedStartIcon}
      {children}
      {clonedEndIcon}
    </span>
  )
}
