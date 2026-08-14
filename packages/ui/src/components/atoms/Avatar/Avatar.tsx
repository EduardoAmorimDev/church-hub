import Image, { ImageProps } from 'next/image'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const avatar = tv({
  base: [
    'flex items-center justify-center overflow-hidden font-semibold',
    'border border-border-neutral-primary rounded-full',
    'bg-background-surface-secondary text-text-neutral-quaternary'
  ],
  variants: {
    size: {
      small: 'w-6 h-6 text-size-10',
      medium: 'w-9 h-9',
      large: 'w-16 h-16 text-size-400',
      xLarge: 'w-20 h-20 text-size-500'
    }
  },
  defaultVariants: {
    size: 'medium'
  }
})

export type AvatarProps = Omit<ImageProps, 'width' | 'height'> &
  VariantProps<typeof avatar>

export const Avatar = ({ size, ...props }: AvatarProps) => {
  const { src, alt } = props
  return (
    <div
      className={avatar({ size })}
      {...(!src && { role: 'img', 'aria-label': alt })}
    >
      {src ? (
        <Image width={80} height={80} {...props} />
      ) : (
        <span aria-hidden="true">
          {alt
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase())
            .join('')}
        </span>
      )}
    </div>
  )
}
