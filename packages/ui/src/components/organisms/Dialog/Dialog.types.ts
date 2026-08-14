import { ReactNode } from 'react'
import { IconName } from '@church/ui/atoms/Icon'

export type DialogColor = 'neutral' | 'destructive' | 'positive' | 'attention'

export type DialogAction = {
  label: string
  onClick?: () => void
  disabled?: boolean
}

export type DialogPrimaryAction = DialogAction & {
  iconName?: IconName
}

export type DialogProps = {
  open: boolean
  /** invariant: Esc, the Fechar button and a scrim click (when
   * `dismissible`) only ask; the consumer sets `open` back to false. */
  onClose?: () => void
  title: ReactNode
  /** invariant: becomes the panel's `aria-describedby`. */
  description?: ReactNode
  children?: ReactNode
  /** why: replaces the built footer; mark the safe button `data-autofocus`. */
  footer?: ReactNode
  primaryAction?: DialogPrimaryAction
  secondaryAction?: DialogAction
  size?: 'small' | 'medium' | 'large'
  /** invariant: Lamb's `status`; `attention` keeps the primary `neutral`. */
  color?: DialogColor
  dismissible?: boolean
  /** invariant: locks the footer, Fechar, Esc and the scrim click. */
  loading?: boolean
  closeLabel?: string
  className?: string
}
