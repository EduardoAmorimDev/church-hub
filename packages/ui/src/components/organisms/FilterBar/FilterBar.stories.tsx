import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { SearchField } from '@church/ui/atoms/SearchField'
import { Select } from '@church/ui/organisms/Select'
import { FilterBar } from './FilterBar'
import { ActiveFilter, FilterBarProps } from './FilterBar.types'

// invariant: synthetic data only (constitution, Principle V).
const FILTERS: ActiveFilter[] = [
  { id: 'rede', label: 'Rede', value: 'Rede Exemplo', iconName: 'hub' },
  { id: 'dia', label: 'Dia', value: 'Terça' },
  { id: 'bairro', label: 'Bairro', value: 'Bairro Exemplo' }
]

const NETWORKS = Array.from({ length: 6 }, (_, index) => ({
  value: `rede-${index + 1}`,
  label: `Rede Exemplo ${index + 1}`
}))

const Render = (args: FilterBarProps) => {
  const [filters, setFilters] = useState(args.filters ?? [])
  return (
    <FilterBar
      {...args}
      filters={filters}
      onChange={setFilters}
      onClear={() => setFilters([])}
    />
  )
}

export default {
  title: 'organisms/FilterBar',
  component: FilterBar,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `FilterBar`: search, a Filtros button with the active count, a live result counter, removable chips for the active filters and "Limpar tudo" from 2 filters. The filters panel opens as a Drawer in Painel and as a `half` BottomSheet in App, decided when it opens. In App the chips scroll sideways instead of wrapping. It has no Figma node: the Lamb artifact created it.'
      }
    },
    layout: 'padded'
  },
  render: Render,
  args: {
    filters: FILTERS,
    filtersLabel: 'Filtros',
    panel: (
      <Select label="Rede" options={NETWORKS} optional presentation="popover" />
    ),
    panelTitle: 'Filtros',
    resultCount: 23,
    resultLabel: count => `${count} GCs`,
    search: <SearchField placeholder="Buscar GC" size="small" />
  },
  argTypes: {
    filters: { control: false },
    panel: { control: false },
    search: { control: false },
    resultLabel: { control: false },
    filtersLabel: { table: { defaultValue: { summary: 'Filtros' } } },
    panelTitle: { table: { defaultValue: { summary: 'Filtros' } } }
  }
} as Meta<FilterBarProps>

export const Default: StoryObj<FilterBarProps> = {}

export const OneFilter: StoryObj<FilterBarProps> = {
  args: { filters: FILTERS.slice(0, 1) }
}

export const WithoutPanel: StoryObj<FilterBarProps> = {
  args: { panel: undefined }
}

export const App: StoryObj<FilterBarProps> = {
  decorators: [
    Story => (
      <div className="max-w-90" data-viewport="mobile">
        <Story />
      </div>
    )
  ]
}
