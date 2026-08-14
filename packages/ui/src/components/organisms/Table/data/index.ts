import { TableLayout, TableState } from '../Table.types'

export const tableLayouts: TableLayout[] = ['row', 'column']

export const tableStates: TableState[] = ['default', 'loading', 'error']

export const dataCellTypes = ['default', 'tag', 'action'] as const
