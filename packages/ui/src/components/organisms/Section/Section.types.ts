import { ReactNode } from 'react'

export type SectionProps = {
  /** invariant: names the `<section>`. */
  title: ReactNode
  description?: ReactNode
  /** why: small Buttons; secondary ones `ghost` neutral, one `filled` neutral. */
  actions?: ReactNode
  /** why: usually a `SearchField size="small"`. */
  search?: ReactNode
  filters?: ReactNode
  footer?: ReactNode
  /** invariant: `button` (default) pads 16px; `paginator` pads 8px × 16px. */
  footerType?: 'paginator' | 'button'
  children?: ReactNode
  headingLevel?: 2 | 3
  /** invariant: drops the search/filters row (Figma Type=Simple). */
  simple?: boolean
  id?: string
  className?: string
}
