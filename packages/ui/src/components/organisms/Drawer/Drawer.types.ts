import { ReactNode } from 'react'

export type DrawerProps = {
  /** invariant: defaults to `true`; `false` renders nothing. */
  open?: boolean
  /** invariant: Esc, Fechar and a scrim click only ask; the consumer
   * closes it. Without it there is no Fechar button. */
  onClose?: () => void
  /** why: a back step in multi-step flows; renders "Voltar" before the title. */
  onBack?: () => void
  title: ReactNode
  description?: ReactNode
  headerActions?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  divider?: boolean
  /** invariant: `modal` is a dialog with scrim, focus trap and Esc;
   * `inline` sits in the layout flow as a named region. */
  mode?: 'modal' | 'inline'
  closeLabel?: string
  className?: string
}
