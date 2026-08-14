import { ReactElement, ReactNode } from 'react'
import { AvatarProps } from '../Avatar'
import { IconProps } from '../Icon'

export type CellType = 'avatar' | 'check' | 'default' | 'tag' | 'action'

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
      /** why: a sortable Table column renders its sort button here. */
      label: ReactNode
      type: 'default'
    })

type DataCellProps =
  | (CellCommon &
      CheckPayload & { disabled?: boolean; heading?: false; type: 'check' })
  | (CellCommon & {
      heading?: false
      /** Drawn at 20px before the text. */
      icon?: ReactElement<IconProps>
      label: string
      paragraph?: string
      type: 'default'
    })
  | (CellCommon & {
      heading?: false
      /** The person's name: the Avatar's initials and the cell's label. */
      label: string
      paragraph?: string
      src?: AvatarProps['src']
      type: 'avatar'
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
