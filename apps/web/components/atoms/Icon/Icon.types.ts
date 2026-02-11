import { MaterialSymbol } from 'material-symbols'
import { ReactElement } from 'react'

export type IconProps = {
  name: MaterialSymbol
  fill?: 0 | 1
  grade?: -25 | 0 | 200
  size?: number
  variant?: 'outlined' | 'rounded' | 'sharp'
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

export type IconElement = ReactElement<IconProps>
