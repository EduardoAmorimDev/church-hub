import { MaterialSymbol } from 'material-symbols'
import { ComponentProps, ReactElement } from 'react'
import { Size } from '~/models'

export type IconProps = ComponentProps<'span'> & {
  fill?: 0 | 1
  grade?: -25 | 0 | 200
  name: MaterialSymbol
  size?: Size
  variant?: 'outlined' | 'rounded' | 'sharp'
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

export type ComponentWithIconProps<T extends keyof JSX.IntrinsicElements> =
  ComponentProps<T> & {
    endIcon?: ReactElement<IconProps>
    startIcon?: ReactElement<IconProps>
  }
