import { MaterialSymbol } from 'material-symbols'
import { ComponentProps, ReactElement } from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'
import { Size } from '@church/ui/models'

// why: the Lamb Figma library still names some glyphs the Material Icons way,
// and Material Symbols folded those names into another glyph.
export const ICON_ALIASES = {
  expand_less: 'keyboard_arrow_up',
  expand_more: 'keyboard_arrow_down'
} as const satisfies Record<string, MaterialSymbol>

export type IconName = MaterialSymbol | keyof typeof ICON_ALIASES

const isIconAlias = (name: IconName): name is keyof typeof ICON_ALIASES =>
  Object.hasOwn(ICON_ALIASES, name)

export const resolveIconName = (name: IconName): MaterialSymbol =>
  isIconAlias(name) ? ICON_ALIASES[name] : name

const icon = tv({
  base: 'leading-none transition-colors',
  variants: {
    color: {
      neutral: 'text-neutral-100 data-[disabled=true]:text-neutral-33',
      red: 'text-red-67 data-[disabled=true]:text-red-33',
      orange: 'text-orange-50 data-[disabled=true]:text-orange-33',
      yellow: 'text-yellow-33 data-[disabled=true]:text-yellow-17',
      lime: 'text-lime-33 data-[disabled=true]:text-lime-17',
      green: 'text-green-67 data-[disabled=true]:text-green-33',
      cyan: 'text-cyan-67 data-[disabled=true]:text-cyan-33',
      blue: 'text-blue-67 data-[disabled=true]:text-blue-33',
      indigo: 'text-indigo-67 data-[disabled=true]:text-indigo-33',
      purple: 'text-purple-67 data-[disabled=true]:text-purple-33',
      pink: 'text-pink-67 data-[disabled=true]:text-pink-33'
    },
    size: {
      xSmall: 'text-icon-12!',
      small: 'text-icon-16!',
      medium: 'text-icon-20!',
      large: 'text-icon-24!',
      xLarge: 'text-icon-28!'
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

export type IconProps = ComponentProps<'span'> &
  VariantProps<typeof icon> & {
    disabled?: boolean
    fill?: 0 | 1
    grade?: -25 | 0 | 200
    name: IconName
    size?: Size
    variant?: 'outlined' | 'rounded' | 'sharp'
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  }

export type ComponentWithIconProps<T extends keyof JSX.IntrinsicElements> =
  ComponentProps<T> & {
    endIcon?: ReactElement<IconProps>
    startIcon?: ReactElement<IconProps>
  }

export function Icon({
  className,
  color,
  disabled,
  fill = 0,
  grade = 0,
  name,
  size,
  variant,
  weight = 400,
  ...props
}: IconProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={icon({
        className,
        color,
        size,
        variant
      })}
      data-disabled={disabled}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}`
      }}
    >
      {resolveIconName(name)}
    </span>
  )
}
