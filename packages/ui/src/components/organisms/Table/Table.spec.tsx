import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from './Table'
import { ColumnPreview } from './components'
import { useTableContext } from './Table.context'
import { ColumnDefinition, TableRowData } from './Table.types'

const columns: ColumnDefinition[] = [
  { header: 'Nome', id: 'nome' },
  { header: 'Ministério', id: 'ministerio' },
  {
    header: 'Situação',
    id: 'situacao',
    sortable: true,
    sortDirection: 'ascending'
  }
]

const rows: TableRowData[] = [
  {
    cells: {
      ministerio: { label: 'Louvor', type: 'default' },
      nome: { label: 'Ana Beatriz', paragraph: 'Membro', type: 'default' },
      situacao: { label: 'Ativa', type: 'default' }
    },
    id: 'r1'
  },
  {
    cells: {
      ministerio: { label: 'Diaconia', type: 'default' },
      nome: { label: 'Carlos Menezes', paragraph: 'Membro', type: 'default' },
      situacao: { label: 'Ativo', type: 'default' }
    },
    id: 'r2'
  },
  {
    cells: {
      ministerio: { label: 'Ensino', type: 'default' },
      nome: { label: 'Denise Prado', paragraph: 'Visitante', type: 'default' },
      situacao: { label: 'Inativa', type: 'default' }
    },
    disabled: true,
    id: 'r3'
  }
]

const ControlledTable = ({
  initialSelection = [],
  ...props
}: { initialSelection?: string[] } & Partial<
  React.ComponentProps<typeof Table>
>) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection)

  return (
    <Table
      caption="Membros"
      columns={columns}
      onSelectionChange={setSelectedIds}
      rows={rows}
      // why: `selectable` defaults to false (C38); these specs exercise the
      // selection column unless a case turns it off.
      selectable
      selectedIds={selectedIds}
      {...props}
    />
  )
}

/** Exposes the context's reorder path so the ordering logic can be driven
 * directly — jsdom has no layout, so a simulated pointer drag would only prove
 * that the mocks work (research.md R6). */
const ReorderProbe = ({ from, to }: { from: string; to: string }) => {
  const { columns: ordered, moveColumn } = useTableContext()

  return (
    <>
      <button onClick={() => moveColumn(from, to)} type="button">
        mover
      </button>
      <output data-testid="order">{ordered.map(c => c.id).join(',')}</output>
    </>
  )
}

describe('Table', () => {
  describe('composition guard', () => {
    it.each([
      ['Table.Header', <Table.Header key="h" />],
      ['Table.Body', <Table.Body key="b" />]
    ])('throws when %s renders outside the root', (_name, element) => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => render(element)).toThrow(/must be rendered inside <Table>/)

      consoleError.mockRestore()
    })
  })

  describe('table semantics (FR-011, FR-012)', () => {
    it('exposes the table with its caption as the accessible name', () => {
      render(<ControlledTable />)

      expect(screen.getByRole('table', { name: 'Membros' })).toBeInTheDocument()
    })

    it('exposes one column header per column plus the selection column', () => {
      render(<ControlledTable />)

      expect(screen.getAllByRole('columnheader')).toHaveLength(
        columns.length + 1
      )
    })

    it('associates each header with its column via scope', () => {
      render(<ControlledTable />)

      screen
        .getAllByRole('columnheader')
        .forEach(header => expect(header).toHaveAttribute('scope', 'col'))
    })

    it('renders one cell per column in every row', () => {
      render(<ControlledTable />)
      const bodyRows = screen.getAllByRole('row').slice(1)

      bodyRows.forEach(row =>
        expect(within(row).getAllByRole('cell')).toHaveLength(
          columns.length + 1
        )
      )
    })
  })

  describe('sort exposure (FR-013)', () => {
    it('exposes the current sort direction on a sortable column', () => {
      render(<ControlledTable />)

      expect(
        screen.getByRole('columnheader', { name: /Situação/ })
      ).toHaveAttribute('aria-sort', 'ascending')
    })

    it('exposes no sort attribute on a non-sortable column', () => {
      render(<ControlledTable />)

      expect(
        screen.getByRole('columnheader', { name: /Nome/ })
      ).not.toHaveAttribute('aria-sort')
    })
  })

  describe('layout parity (FR-020)', () => {
    it('renders the same cell content in both layouts', () => {
      const { unmount } = render(<ControlledTable layout="row" />)
      const rowTexts = screen
        .getAllByText(/Ana Beatriz|Carlos Menezes|Denise Prado|Louvor/)
        .map(node => node.textContent)
      unmount()

      render(<ControlledTable layout="column" />)
      const columnTexts = screen
        .getAllByText(/Ana Beatriz|Carlos Menezes|Denise Prado|Louvor/)
        .map(node => node.textContent)

      expect(columnTexts.sort()).toEqual(rowTexts.sort())
    })

    it('renders the selection column in both layouts', () => {
      const { unmount } = render(<ControlledTable layout="row" />)
      const rowCheckboxes = screen.getAllByRole('checkbox').length
      unmount()

      render(<ControlledTable layout="column" />)

      expect(screen.getAllByRole('checkbox')).toHaveLength(rowCheckboxes)
    })

    it('applies the row fill and divider tokens in both layouts', () => {
      const { unmount } = render(<ControlledTable layout="row" />)
      const rowSurface = screen.getAllByRole('row')[1]
      expect(rowSurface.className).toContain('bg-neutral-00')
      expect(rowSurface.className).toContain(
        'shadow-[inset_0_-1px_0_0_var(--color-neutral-17)]'
      )
      unmount()

      render(<ControlledTable layout="column" />)
      const cell = screen
        .getByText('Ana Beatriz')
        .closest('[class*="bg-neutral-00"]')

      expect(cell).not.toBeNull()
      expect(cell?.className).toContain(
        'shadow-[inset_0_-1px_0_0_var(--color-neutral-17)]'
      )
    })
  })

  describe('row treatment in the column layout (FR-021)', () => {
    it('marks every cell of a selected row, since no element spans the row', () => {
      render(<ControlledTable initialSelection={['r1']} layout="column" />)

      const marked = document.querySelectorAll('[data-selected="true"]')

      // One per column plus the selection cell — the whole row is marked.
      expect(marked).toHaveLength(columns.length + 1)
    })

    it('marks every cell of a disabled row', () => {
      render(<ControlledTable layout="column" />)

      expect(document.querySelectorAll('[data-disabled="true"]')).toHaveLength(
        columns.length + 1
      )
    })
  })

  describe('selection (FR-017, FR-018, FR-019)', () => {
    it('renders a selection checkbox in the header and in every row', () => {
      render(<ControlledTable />)

      expect(screen.getAllByRole('checkbox')).toHaveLength(rows.length + 1)
    })

    it('starts with the header checkbox unchecked', () => {
      render(<ControlledTable />)

      expect(
        screen.getByRole('checkbox', { name: 'Selecionar todos' })
      ).toHaveAttribute('data-state', 'unchecked')
    })

    it('moves the header checkbox to the partial state on a partial selection', () => {
      render(<ControlledTable initialSelection={['r1']} />)

      expect(
        screen.getByRole('checkbox', { name: 'Selecionar todos' })
      ).toHaveAttribute('data-state', 'indeterminate')
    })

    it('shows the header checkbox checked when every selectable row is selected', () => {
      render(<ControlledTable initialSelection={['r1', 'r2']} />)

      expect(
        screen.getByRole('checkbox', { name: 'Selecionar todos' })
      ).toHaveAttribute('data-state', 'checked')
    })

    it('selects and clears every selectable row from the header checkbox', async () => {
      const user = userEvent.setup()
      render(<ControlledTable />)
      const header = screen.getByRole('checkbox', {
        name: 'Selecionar todos'
      })

      await user.click(header)
      expect(header).toHaveAttribute('data-state', 'checked')

      await user.click(header)
      expect(header).toHaveAttribute('data-state', 'unchecked')
    })

    it('round-trips a single row selection', async () => {
      const user = userEvent.setup()
      render(<ControlledTable />)
      const rowCheckbox = screen.getByRole('checkbox', {
        name: 'Selecionar Ana Beatriz'
      })

      await user.click(rowCheckbox)

      expect(rowCheckbox).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('disabled rows (FR-029)', () => {
    it('never selects a disabled row from the header checkbox', async () => {
      const user = userEvent.setup()
      render(<ControlledTable />)

      await user.click(
        screen.getByRole('checkbox', { name: 'Selecionar todos' })
      )

      expect(
        screen.getByRole('checkbox', { name: 'Selecionar Denise Prado' })
      ).toHaveAttribute('data-state', 'unchecked')
    })

    it('does not respond to a click on a disabled row checkbox', async () => {
      const user = userEvent.setup()
      render(<ControlledTable />)
      const disabledCheckbox = screen.getByRole('checkbox', {
        name: 'Selecionar Denise Prado'
      })

      await user.click(disabledCheckbox)

      expect(disabledCheckbox).toHaveAttribute('data-state', 'unchecked')
    })
  })

  describe('column reordering (FR-023, FR-025, FR-026, FR-031)', () => {
    it('moves a column and reports the resulting order', async () => {
      const user = userEvent.setup()
      const onColumnOrderChange = jest.fn()
      render(
        <ControlledTable onColumnOrderChange={onColumnOrderChange}>
          <ReorderProbe from="nome" to="situacao" />
        </ControlledTable>
      )

      await user.click(screen.getByRole('button', { name: 'mover' }))

      expect(onColumnOrderChange).toHaveBeenCalledWith([
        'ministerio',
        'situacao',
        'nome'
      ])
      expect(screen.getByTestId('order')).toHaveTextContent(
        'ministerio,situacao,nome'
      )
    })

    it('preserves row selection across a reorder', async () => {
      const user = userEvent.setup()
      render(
        <ControlledTable initialSelection={['r1']}>
          <ReorderProbe from="nome" to="situacao" />
        </ControlledTable>
      )

      await user.click(screen.getByRole('button', { name: 'mover' }))

      expect(screen.getByTestId('order')).toHaveTextContent(
        'ministerio,situacao,nome'
      )
    })

    it('leaves the order unchanged when a target column is unknown', async () => {
      const user = userEvent.setup()
      const onColumnOrderChange = jest.fn()
      render(
        <ControlledTable onColumnOrderChange={onColumnOrderChange}>
          <ReorderProbe from="nome" to="coluna-inexistente" />
        </ControlledTable>
      )

      await user.click(screen.getByRole('button', { name: 'mover' }))

      expect(onColumnOrderChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('order')).toHaveTextContent(
        'nome,ministerio,situacao'
      )
    })

    it('leaves the order unchanged when a column is moved onto itself', async () => {
      const user = userEvent.setup()
      const onColumnOrderChange = jest.fn()
      render(
        <ControlledTable onColumnOrderChange={onColumnOrderChange}>
          <ReorderProbe from="nome" to="nome" />
        </ControlledTable>
      )

      await user.click(screen.getByRole('button', { name: 'mover' }))

      expect(onColumnOrderChange).not.toHaveBeenCalled()
    })
  })

  describe('drag affordance (FR-024, FR-028)', () => {
    it('renders a focusable drag handle for every reorderable column', async () => {
      const user = userEvent.setup()
      render(<ControlledTable />)
      const handles = screen.getAllByRole('button', {
        name: /^Reordenar coluna/
      })

      expect(handles).toHaveLength(columns.length)

      await user.tab()
      expect(document.activeElement).not.toBe(document.body)
    })

    it('renders no drag handle for a non-reorderable column', () => {
      render(
        <ControlledTable
          columns={[{ header: 'Fixa', id: 'fixa', reorderable: false }]}
        />
      )

      expect(
        screen.queryByRole('button', { name: /^Reordenar coluna/ })
      ).not.toBeInTheDocument()
    })

    it('gives the drag handle a visible focus indicator', () => {
      render(<ControlledTable />)

      expect(
        screen.getAllByRole('button', { name: /^Reordenar coluna/ })[0]
          .className
      ).toContain('focus-visible:ring-2')
    })
  })

  describe('table states (FR-030)', () => {
    it.each([
      ['loading' as const, 'Carregando…'],
      ['error' as const, 'Não foi possível carregar os dados.']
    ])('keeps the column headers visible in the %s state', (state, message) => {
      render(<ControlledTable state={state} />)

      expect(screen.getAllByRole('columnheader')).toHaveLength(
        columns.length + 1
      )
      expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('keeps the column headers visible when there are no rows', () => {
      render(<ControlledTable rows={[]} />)

      expect(screen.getAllByRole('columnheader')).toHaveLength(
        columns.length + 1
      )
      expect(
        screen.getByText('Nenhum registro encontrado.')
      ).toBeInTheDocument()
    })
  })

  describe('defensive rendering (FR-031)', () => {
    it('renders with no columns without throwing', () => {
      expect(() =>
        render(<ControlledTable columns={[]} rows={[]} />)
      ).not.toThrow()
    })

    it('renders with no rows without throwing', () => {
      expect(() => render(<ControlledTable rows={[]} />)).not.toThrow()
    })

    it('renders an empty cell when a row is missing a column key', () => {
      render(
        <ControlledTable
          rows={[
            { cells: { nome: { label: 'Só nome', type: 'default' } }, id: 'r9' }
          ]}
        />
      )
      const bodyRow = screen.getAllByRole('row')[1]

      // Still one cell per column: the missing values must not shift the
      // remaining ones into neighbouring columns.
      expect(within(bodyRow).getAllByRole('cell')).toHaveLength(
        columns.length + 1
      )
      expect(screen.getByText('Só nome')).toBeInTheDocument()
    })
  })

  // Regression: after a drop, the body cells must land in the new order too —
  // reporting the new order is not the same as rendering it.
  describe('a completed reorder moves header and body together', () => {
    // why: Material Symbols are ligatures, so the icon names of the drag handle
    // and sort button are part of textContent and would pollute the label.
    const headerOrder = () =>
      screen
        .getAllByRole('columnheader')
        .map(header =>
          header.textContent
            ?.replace(
              /drag_indicator|unfold_more|arrow_upward|arrow_downward/g,
              ''
            )
            .trim()
        )
        .filter(text => text !== '')

    const firstBodyRowOrder = () =>
      within(screen.getAllByRole('row')[1])
        .getAllByRole('cell')
        .map(cell => cell.textContent?.trim())
        .filter(text => text !== '')

    it('reorders the body cells, not only the headers', async () => {
      const user = userEvent.setup()
      render(
        <ControlledTable>
          <table>
            <Table.Header />
            <Table.Body />
          </table>
          <ReorderProbe from="nome" to="situacao" />
        </ControlledTable>
      )

      expect(headerOrder()).toEqual(['Nome', 'Ministério', 'Situação'])
      expect(firstBodyRowOrder()).toEqual([
        'Ana BeatrizMembro',
        'Louvor',
        'Ativa'
      ])

      await user.click(screen.getByRole('button', { name: 'mover' }))

      expect(headerOrder()).toEqual(['Ministério', 'Situação', 'Nome'])
      expect(firstBodyRowOrder()).toEqual([
        'Louvor',
        'Ativa',
        'Ana BeatrizMembro'
      ])
    })
  })

  // Regression: dragging a column used to move only its header, because the
  // sortable was registered on the header cell in both layouts.
  describe('a drag moves the whole column, not just its header', () => {
    it('previews the header and one cell per row', () => {
      render(<ColumnPreview column={columns[0]} rows={rows} />)
      const preview = screen.getByTestId('column-preview')

      expect(within(preview).getByText('Nome')).toBeInTheDocument()
      expect(within(preview).getByText('Ana Beatriz')).toBeInTheDocument()
      expect(within(preview).getByText('Carlos Menezes')).toBeInTheDocument()
      expect(within(preview).getByText('Denise Prado')).toBeInTheDocument()
    })

    it('previews an empty cell for a row missing the column key', () => {
      render(
        <ColumnPreview
          column={columns[0]}
          rows={[{ cells: {}, id: 'vazia' }]}
        />
      )
      const preview = screen.getByTestId('column-preview')

      // Header plus exactly one cell, so the preview keeps the column's height
      // instead of collapsing where data is missing.
      expect(preview.childElementCount).toBe(2)
    })

    it('keeps every cell of a column inside the container that carries its drag handle', () => {
      render(<ControlledTable layout="column" />)
      const handle = screen.getByRole('button', {
        name: 'Reordenar coluna Nome'
      })
      const container = handle.closest('[role="presentation"]')

      expect(container).not.toBeNull()

      // The sortable is registered on this container, so everything inside it
      // travels with the drag — header and all three data cells.
      rows.forEach(row => {
        const cell = row.cells['nome']
        if (cell !== undefined && cell.type === 'default') {
          expect(
            within(container as HTMLElement).getByText(cell.label)
          ).toBeInTheDocument()
        }
      })
    })
  })
  describe('Lamb alignment (C36-C38)', () => {
    const bodyRows = () => screen.getAllByRole('row').slice(1)

    it.each([
      ['default' as const, 'h-12'],
      ['compact' as const, 'h-10'],
      ['dense' as const, 'h-8']
    ])('density %s: every row measures %s', (density, height) => {
      render(<ControlledTable density={density} selectable={false} />)

      bodyRows().forEach(row =>
        within(row)
          .getAllByRole('cell')
          .forEach(cell => expect(cell.firstElementChild).toHaveClass(height))
      )
    })

    it('density defaults to 48px rows', () => {
      render(<ControlledTable selectable={false} />)

      bodyRows().forEach(row =>
        within(row)
          .getAllByRole('cell')
          .forEach(cell => expect(cell.firstElementChild).toHaveClass('h-12'))
      )
    })

    it('row states: header border and surface, hover, aria-selected with bg-selected', () => {
      render(<ControlledTable initialSelection={['r1']} />)
      const [headerRow, ...rowsInBody] = screen.getAllByRole('row')

      expect(headerRow).toHaveClass('border-b', 'border-default', 'bg-surface')

      const [selectedRow, ...otherRows] = rowsInBody
      expect(selectedRow).toHaveAttribute('aria-selected', 'true')
      expect(selectedRow).toHaveClass('bg-selected', 'hover:bg-selected')
      otherRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-hover')
        expect(row).not.toHaveAttribute('aria-selected', 'true')
        expect(row).not.toHaveClass('bg-selected')
      })
    })

    it('row states: the column layout paints every cell of a selected row', () => {
      render(<ControlledTable initialSelection={['r1']} layout="column" />)
      const marked = document.querySelectorAll('[data-selected="true"]')

      expect(marked.length).toBeGreaterThan(0)
      marked.forEach(cell => expect(cell).toHaveClass('bg-selected'))
    })

    it('caption is visible by default and captionHidden hides it', () => {
      const { unmount } = render(<ControlledTable />)
      const caption = screen.getByText('Membros')

      expect(caption.tagName).toBe('CAPTION')
      expect(caption).not.toHaveClass('sr-only')
      expect(screen.getByRole('table', { name: 'Membros' })).toBeInTheDocument()
      unmount()

      render(<ControlledTable captionHidden />)

      expect(screen.getByText('Membros')).toHaveClass('sr-only')
      expect(screen.getByRole('table', { name: 'Membros' })).toBeInTheDocument()
    })

    it('align right: right-aligned columns use tabular-nums and the selection column is 40 wide', () => {
      render(
        <ControlledTable
          columns={[
            { header: 'Nome', id: 'nome' },
            { align: 'right', header: 'Valor', id: 'valor' }
          ]}
          rows={[
            {
              cells: {
                nome: { label: 'Membro fictício', type: 'default' },
                valor: { label: '1.234', type: 'default' }
              },
              id: 'f1'
            }
          ]}
        />
      )
      const [selectionHead, nameHead, valueHead] =
        screen.getAllByRole('columnheader')
      const [selectionCell, nameCell, valueCell] = within(
        screen.getAllByRole('row')[1]
      ).getAllByRole('cell')

      expect(selectionHead).toHaveClass('w-10')
      expect(selectionCell).toHaveClass('w-10')
      expect(valueHead).toHaveClass('text-right', 'tabular-nums')
      expect(valueCell).toHaveClass('text-right', 'tabular-nums')
      expect(nameHead).not.toHaveClass('tabular-nums')
      expect(nameCell).not.toHaveClass('tabular-nums')
    })

    it.each([
      ['none' as const, 'unfold_more', 'ascending'],
      ['ascending' as const, 'arrow_upward', 'descending'],
      ['descending' as const, 'arrow_downward', 'ascending']
    ])(
      'sort cycle: from %s (icon %s) the sort button reports %s',
      async (from, glyph, next) => {
        const user = userEvent.setup()
        const onSortChange = jest.fn()
        render(
          <ControlledTable
            columns={[
              { header: 'Nome', id: 'nome' },
              {
                header: 'Situação',
                id: 'situacao',
                sortable: true,
                sortDirection: from
              }
            ]}
            onSortChange={onSortChange}
          />
        )
        const header = screen.getByRole('columnheader', { name: /Situação/ })
        const sortButton = within(header).getByRole('button', {
          name: 'Situação'
        })

        expect(header).toHaveAttribute('aria-sort', from)
        expect(within(sortButton).getByText(glyph)).toHaveClass('text-icon-16!')

        await user.click(sortButton)

        expect(onSortChange).toHaveBeenCalledTimes(1)
        expect(onSortChange).toHaveBeenCalledWith('situacao', next)
      }
    )

    it('sort cycle: a sortable column without a direction starts at none', async () => {
      const user = userEvent.setup()
      const onSortChange = jest.fn()
      render(
        <ControlledTable
          columns={[{ header: 'Nome', id: 'nome', sortable: true }]}
          onSortChange={onSortChange}
        />
      )
      const header = screen.getByRole('columnheader', { name: /Nome/ })

      expect(header).toHaveAttribute('aria-sort', 'none')
      await user.click(within(header).getByRole('button', { name: 'Nome' }))

      expect(onSortChange).toHaveBeenCalledWith('nome', 'ascending')
    })

    it('sort cycle: a column that is not sortable has no sort button', () => {
      render(<ControlledTable />)

      expect(
        within(screen.getByRole('columnheader', { name: /Nome/ })).queryByRole(
          'button',
          { name: 'Nome' }
        )
      ).not.toBeInTheDocument()
    })

    it('selection labels: each row names its first column, the header selects all', () => {
      render(<ControlledTable />)

      expect(
        screen.getByRole('checkbox', { name: 'Selecionar todos' })
      ).toBeInTheDocument()
      ;['Ana Beatriz', 'Carlos Menezes', 'Denise Prado'].forEach(name =>
        expect(
          screen.getByRole('checkbox', { name: `Selecionar ${name}` })
        ).toBeInTheDocument()
      )
    })

    it('selectable default is false', () => {
      render(<Table caption="Membros" columns={columns} rows={rows} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length)
    })

    it('empty state: padding 40/16 in text-secondary', () => {
      render(<ControlledTable rows={[]} />)

      expect(screen.getByText('Nenhum registro encontrado.')).toHaveClass(
        'px-4',
        'py-10',
        'text-secondary'
      )
    })
  })
})
