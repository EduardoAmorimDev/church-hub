import { ReactNode } from 'react'

export type BottomSheetProps = {
  open: boolean
  /** invariant: Fechar, Esc, a dismissing drag and a scrim click (when
   * `dismissible`) only ask; the consumer sets `open` back to false. */
  onClose?: () => void
  title: ReactNode
  /** invariant: `auto` follows the content up to the screen minus 24px. */
  detents?: 'auto' | 'half' | 'full'
  dismissible?: boolean
  children?: ReactNode
  /** invariant: each child takes the full width. */
  footer?: ReactNode
  /** why: `env` reserves the device inset (production default); `mock`
   * draws a fake home indicator for prototypes (lamb-overlays Unresolved 1). */
  safeArea?: 'env' | 'mock' | 'none'
  closeLabel?: string
  className?: string
}
