import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { IconElement } from '../Icon'

type PrimitiveButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

type IconButtonProps = {
  icon?: IconElement
  startIcon?: never
  endIcon?: never
}

type TextButtonProps = {
  icon?: never
  startIcon?: IconElement
  endIcon?: IconElement
}

export type BaseButtonProps = PrimitiveButtonProps &
  (IconButtonProps | TextButtonProps)
