import { ReactNode } from 'react'

export type SectionProps = {
  /** invariant: names the `<section>`. */
  title: ReactNode
  /** invariant: the title still names the `<section>` but is visually
   * hidden; with no `description` or `actions` the top row is dropped. */
  titleHidden?: boolean
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
