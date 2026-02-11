import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { IconElement } from '../Icon'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  startIcon?: IconElement
  endIcon?: IconElement
}
