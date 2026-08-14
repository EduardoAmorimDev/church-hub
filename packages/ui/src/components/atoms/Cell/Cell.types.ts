import { ReactElement, ReactNode } from 'react'
import { IconProps } from '../Icon'

export type CellType = 'check' | 'default' | 'tag' | 'action'

type CellCommon = {
  className?: string
}

type CheckPayload = {
  'aria-label': string
  checked: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export type CellAction = {
  'aria-label': string
  disabled?: boolean
  icon: ReactElement<IconProps>
  onClick: () => void
}

// `heading` is only combinable with 'check' and 'default': the Figma component
// set (node 13615:5291) defines no heading counterpart for the other types, so
// spec.md FR-002 requires those combinations to be unrepresentable rather than
// rejected at runtime.
type HeadingCellProps =
  | (CellCommon & CheckPayload & { heading: true; type: 'check' })
  | (CellCommon & {
      heading: true
      iconLeft?: ReactNode
      iconRight?: ReactNode
      label: string
      type: 'default'
    })

type DataCellProps =
  | (CellCommon &
      CheckPayload & { disabled?: boolean; heading?: false; type: 'check' })
  | (CellCommon & {
      heading?: false
      label: string
      paragraph?: string
      type: 'default'
    })
  | (CellCommon & {
      action?: ReactNode
      heading?: false
      icon?: ReactNode
      tag: ReactNode
      type: 'tag'
    })
  | (CellCommon & {
      actions: ReadonlyArray<CellAction>
      heading?: false
      type: 'action'
    })

export type CellProps = HeadingCellProps | DataCellProps
