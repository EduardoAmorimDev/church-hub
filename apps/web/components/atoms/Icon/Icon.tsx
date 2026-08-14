import { tv } from '~/lib/tailwind-variants'

import { IconProps } from './models'

const icon = tv({
  base: 'material-symbol',
  variants: {
    color: {
      neutral: 'text-neutral-100',
      red: 'text-red-67',
      orange: 'text-orange-50',
      yellow: 'text-yellow-33',
      lime: 'text-lime-33',
      green: 'text-green-67',
      cyan: 'text-cyan-67',
      blue: 'text-blue-67',
      indigo: 'text-indigo-67',
      purple: 'text-purple-67',
      pink: 'text-pink-67'
    },
    size: {
      xSmall: 'text-[12px]!',
      small: 'text-[16px]!',
      medium: 'text-[20px]!',
      large: 'text-[24px]!',
      xLarge: 'text-[28px]!'
    },
    variant: {
      outlined: 'material-symbols-outlined',
      rounded: 'material-symbols-rounded',
      sharp: 'material-symbols-sharp'
    }
  },
  defaultVariants: {
    color: 'neutral',
    size: 'medium',
    variant: 'outlined'
  }
})

export function Icon({
  className,
  fill = 0,
  grade = 0,
  name,
  size,
  variant,
  weight = 400
}: IconProps) {
  return (
    <span
      className={icon({
        className,
        size,
        variant
      })}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}`
      }}
    >
      {name}
    </span>
  )
}
