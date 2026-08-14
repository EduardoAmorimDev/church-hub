import { useState } from 'react'
import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { Table } from './Table'
import { tableLayouts, tableStates } from './data'
import { ColumnDefinition, TableRowData } from './Table.types'
import { Icon } from '@church/ui/atoms/Icon'
import { Tag } from '@church/ui/atoms/Tag'

// Synthetic data only — a members table is exactly where real personal data
// would leak into a repository (constitution, Principle V).
const columns: ColumnDefinition[] = [
  { header: 'Nome', id: 'nome' },
  { header: 'Ministério', id: 'ministerio' },
  { header: 'Situação', id: 'situacao', sortable: true, sortDirection: 'none' },
  { header: 'Ações', id: 'acoes', reorderable: false }
]

const rows: TableRowData[] = [
  {
    cells: {
      acoes: {
        actions: [
          {
            'aria-label': 'Editar',
            icon: <Icon name="edit" />,
            onClick: () => {}
          },
          {
            'aria-label': 'Remover',
            icon: <Icon name="delete" />,
            onClick: () => {}
          }
        ],
        type: 'action'
      },
      ministerio: { label: 'Louvor', type: 'default' },
      nome: {
        label: 'Ana Beatriz',
        paragraph: 'Membro desde 2019',
        type: 'default'
      },
      situacao: { tag: <Tag size="small">Ativa</Tag>, type: 'tag' }
    },
    id: 'r1'
  },
  {
    cells: {
      acoes: {
        actions: [
          {
            'aria-label': 'Editar',
            icon: <Icon name="edit" />,
            onClick: () => {}
          }
        ],
        type: 'action'
      },
      ministerio: { label: 'Diaconia', type: 'default' },
      nome: {
        label: 'Carlos Menezes',
        paragraph: 'Membro desde 2021',
        type: 'default'
      },
      situacao: { tag: <Tag size="small">Ativo</Tag>, type: 'tag' }
    },
    id: 'r2'
  },
  {
    cells: {
      acoes: { actions: [], type: 'action' },
      ministerio: { label: 'Ensino', type: 'default' },
      nome: { label: 'Denise Prado', paragraph: 'Visitante', type: 'default' },
      situacao: { tag: <Tag size="small">Inativa</Tag>, type: 'tag' }
    },
    disabled: true,
    id: 'r3'
  }
]

const meta: Meta<typeof Table> = {
  title: 'organisms/Table',
  component: Table,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13616-5097&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Table` organism. Compound API: `Table.Header`, `Table.Body`, `Table.Row`, `Table.Column`, `Table.Head`, `Table.Cell`. Column order and selection live in the root.'
      }
    },
    layout: 'padded'
  },
  args: { caption: 'Membros', columns, rows },
  argTypes: {
    layout: {
      control: 'select',
      options: tableLayouts,
      table: {
        type: { summary: tableLayouts.join(' | ') },
        defaultValue: { summary: 'row' }
      }
    },
    state: {
      control: 'select',
      options: tableStates,
      table: {
        type: { summary: tableStates.join(' | ') },
        defaultValue: { summary: 'default' }
      }
    },
    selectable: { control: 'boolean' }
  }
}
export default meta

const Selectable: StoryFn<typeof Table> = args => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <Table
      {...args}
      onSelectionChange={setSelectedIds}
      selectedIds={selectedIds}
    />
  )
}

export const Default: StoryObj<typeof Table> = { render: Selectable }

export const ColumnLayout: StoryObj<typeof Table> = {
  args: { layout: 'column' },
  render: Selectable
}

/** The single highest-value visual check in the feature: both layouts must be
 * indistinguishable (FR-020). */
export const LayoutParity: StoryFn<typeof Table> = args => (
  <div className="flex flex-col gap-8">
    <section>
      <h3 className="text-neutral-83 text-size-50 mb-2">Row layout</h3>
      <Table {...args} layout="row" />
    </section>
    <section>
      <h3 className="text-neutral-83 text-size-50 mb-2">Column layout</h3>
      <Table {...args} layout="column" />
    </section>
  </div>
)

const PreSelected: StoryFn<typeof Table> = args => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['r1'])

  return (
    <Table
      {...args}
      onSelectionChange={setSelectedIds}
      selectedIds={selectedIds}
    />
  )
}

export const PartialSelection: StoryObj<typeof Table> = { render: PreSelected }

export const Empty: StoryObj<typeof Table> = { args: { rows: [] } }

export const Loading: StoryObj<typeof Table> = { args: { state: 'loading' } }

export const Error: StoryObj<typeof Table> = { args: { state: 'error' } }
