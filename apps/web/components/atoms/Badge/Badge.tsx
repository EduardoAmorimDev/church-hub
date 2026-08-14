import { tv, VariantProps } from '~/lib/tailwind-variants'
import { Tag, tag, TagProps } from '../Tag'
import { getClonedResizedIcons } from '~/components/utils'
import { twJoin } from '~/lib/tailwind-merge'

const {
  base,
  defaultVariants,
  variants: { size }
} = tag

const badge = tv({
  base: twJoin('text-neutral-00', base),
  variants: {
    color: {
      neutral: 'bg-neutral-00 border border-neutral-alpha/20 text-neutral-83',
      red: 'bg-red-67',
      orange: 'bg-orange-50',
      yellow: 'bg-yellow-33',
      lime: 'bg-lime-33',
      green: 'bg-green-67',
      cyan: 'bg-cyan-67',
      blue: 'bg-blue-67',
      indigo: 'bg-indigo-67',
      purple: 'bg-purple-67',
      pink: 'bg-pink-67'
    },
    size
  },
  defaultVariants
})

export type BadgeProps = TagProps &
  VariantProps<typeof badge> & {
    variant?: 'low' | 'high'
  }

export const Badge = ({ variant = 'high', ...props }: BadgeProps) => {
  if (variant === 'low') return <Tag {...props} />

  const {
    children,
    color = 'neutral',
    endIcon,
    startIcon,
    size,
    ...rest
  } = props
  const [clonedStartIcon, clonedEndIcon] = getClonedResizedIcons({
    icons: [startIcon, endIcon],
    size
  })

  return (
    <div className={badge({ color, size })} {...rest}>
      {clonedStartIcon}
      {children}
      {clonedEndIcon}
    </div>
  )
}
