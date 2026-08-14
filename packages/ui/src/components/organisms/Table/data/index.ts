import { TableDensity, TableLayout, TableState } from '../Table.types'

export const tableLayouts: TableLayout[] = ['row', 'column']

export const tableStates: TableState[] = ['default', 'loading', 'error']

export const tableDensities: TableDensity[] = ['default', 'compact', 'dense']

export const dataCellTypes = ['default', 'avatar', 'tag', 'action'] as const
