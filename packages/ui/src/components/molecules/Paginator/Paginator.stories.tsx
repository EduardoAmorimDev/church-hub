import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Table } from '@church/ui/organisms/Table'
import type { ColumnDefinition, TableRowData } from '@church/ui/organisms/Table'
import { Paginator } from './Paginator'
import { PaginatorProps } from './Paginator.types'

const ControlledPaginator = (args: PaginatorProps) => {
  const [page, setPage] = useState(args.page)
  const [pageSize, setPageSize] = useState(args.pageSize)

  return (
    <Paginator
      {...args}
      onPageChange={nextPage => {
        setPage(nextPage)
        args.onPageChange(nextPage)
      }}
      onPageSizeChange={nextPageSize => {
        setPageSize(nextPageSize)
        args.onPageSizeChange(nextPageSize)
      }}
      page={page}
      pageSize={pageSize}
    />
  )
}

const meta: Meta<PaginatorProps> = {
  title: 'molecules/Paginator',
  component: Paginator,
  excludeStories: ['PaginatedTableExample'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13607-2572&m=dev'
    },
    docs: { description: { component: 'The Lamb Paginator component' } }
  },
  args: {
    onPageChange: () => {},
    onPageSizeChange: () => {},
    page: 1,
    pageSize: 10,
    totalItems: 300
  },
  render: args => <ControlledPaginator {...args} />
}

export default meta
type Story = StoryObj<PaginatorProps>

export const Default: Story = {}

export const FewPages: Story = { args: { totalItems: 50 } }

export const Empty: Story = { args: { totalItems: 0 } }

export const ThousandsSeparator: Story = { args: { totalItems: 1284 } }

export const CustomLabel: Story = { args: { label: 'Paginação de membros' } }

// why: synthetic rows only - a members table is where real personal data
// would leak into the repository (constitution, Principle V).
const columns: ColumnDefinition[] = [
  { header: 'Nome', id: 'nome' },
  { header: 'Ministério', id: 'ministerio' }
]

const rows: TableRowData[] = Array.from({ length: 30 }, (_, index) => ({
  cells: {
    ministerio: { label: 'Ministério fictício', type: 'default' },
    nome: { label: `Membro fictício ${index + 1}`, type: 'default' }
  },
  id: `membro-${index + 1}`
}))

export const PaginatedTableExample = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col gap-2">
      <Table
        caption="Membros"
        columns={columns}
        rows={pageRows}
        selectable={false}
      />
      <Paginator
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={page}
        pageSize={pageSize}
        totalItems={rows.length}
      />
    </div>
  )
}

export const WithTable: Story = { render: () => <PaginatedTableExample /> }
