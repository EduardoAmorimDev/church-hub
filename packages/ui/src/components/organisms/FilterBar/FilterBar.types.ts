import { ReactNode } from 'react'
import type { IconName } from '@church/ui/atoms/Icon'

export type ActiveFilter = {
  id: string
  label: string
  value: string
  iconName?: IconName
}

export type FilterBarProps = {
  /** why: usually a `SearchField size="small"`. */
  search?: ReactNode
  filters?: ActiveFilter[]
  /** invariant: receives the list without the removed filter. */
  onChange?: (filters: ActiveFilter[]) => void
  /** why: "Limpar tudo" and the panel's "Limpar" both call it. */
  onClear?: () => void
  resultCount?: number
  /** invariant: defaults to "{n} resultados", also for 1 (Unresolved 3). */
  resultLabel?: (count: number) => string
  /** invariant: without it there is no Filtros button and no panel. */
  panel?: ReactNode
  panelTitle?: string
  /** invariant: only "Ver resultados" calls it; Esc, scrim and Fechar do not. */
  onApply?: () => void
  filtersLabel?: string
  className?: string
}
