'use client'

import Image, { ImageProps } from 'next/image'
import { ComponentProps, useState } from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: Lamb outlines the avatar with an inset 1px `border-default`, which is
// neutral-17 in both themes; `inset-ring` paints it without taking space.
const avatar = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
      'bg-neutral-17 font-semibold text-neutral-100 inset-ring inset-ring-neutral-17'
    ],
    photo: 'size-full object-cover'
  },
  variants: {
    size: {
      xSmall: { root: 'size-6 text-size-25' },
      small: { root: 'size-8 text-size-25' },
      medium: { root: 'size-12 text-size-100' },
      large: { root: 'size-14 text-size-200' },
      xLarge: { root: 'size-20 text-size-400' }
    }
  },
  defaultVariants: {
    size: 'small'
  }
})

type AvatarImageProps = Pick<
  ImageProps,
  | 'blurDataURL'
  | 'loader'
  | 'placeholder'
  | 'priority'
  | 'quality'
  | 'sizes'
  | 'src'
  | 'unoptimized'
>

export type AvatarProps = Omit<
  ComponentProps<'div'>,
  'children' | keyof AvatarImageProps
> &
  AvatarImageProps &
  VariantProps<typeof avatar> & {
    /** invariant: the person's name, used as accessible name and initials. */
    alt: string
  }

const getInitials = (name: string) => {
  const words = name.split(' ').filter(word => word.length > 0)
  const first = words.at(0)
  const last = words.length > 1 ? words.at(-1) : undefined
  return [first, last].map(word => word?.charAt(0).toUpperCase() ?? '').join('')
}

export const Avatar = ({
  alt,
  blurDataURL,
  className,
  loader,
  placeholder,
  priority,
  quality,
  size,
  sizes,
  src,
  unoptimized,
  ...props
}: AvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<AvatarImageProps['src']>()
  const slots = avatar({ size })
  const showPhoto = Boolean(src) && failedSrc !== src

  return (
    <div
      {...props}
      aria-label={alt}
      className={slots.root({ className })}
      role="img"
    >
      {showPhoto ? (
        <Image
          alt=""
          blurDataURL={blurDataURL}
          className={slots.photo()}
          height={80}
          loader={loader}
          onError={() => setFailedSrc(src)}
          placeholder={placeholder}
          priority={priority}
          quality={quality}
          sizes={sizes}
          src={src}
          unoptimized={unoptimized}
          width={80}
        />
      ) : (
        <span aria-hidden="true">{getInitials(alt)}</span>
      )}
    </div>
  )
}
