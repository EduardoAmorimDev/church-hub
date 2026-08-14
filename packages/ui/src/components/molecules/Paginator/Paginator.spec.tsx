import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Paginator } from './Paginator'
import { PaginatorProps } from './Paginator.types'
import meta, { PaginatedTableExample, WithTable } from './Paginator.stories'

const renderPaginator = (props: Partial<PaginatorProps> = {}) => {
  const onPageChange = jest.fn()
  const onPageSizeChange = jest.fn()

  const utils = render(
    <Paginator
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      page={1}
      pageSize={10}
      totalItems={300}
      {...props}
    />
  )

  return { ...utils, onPageChange, onPageSizeChange }
}

const pageButtonLabels = () =>
  screen
    .queryAllByRole('button', { name: /^Página \d+$/ })
    .map(button => button.textContent)

const expectInDocumentOrder = (elements: HTMLElement[]) => {
  elements.slice(1).forEach((element, index) => {
    const previous = elements[index]
    expect(
      previous?.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
}

describe('Paginator', () => {
  it('C1 renders the designed layout', () => {
    renderPaginator()

    const sizeSelect = screen.getByRole('combobox', { name: 'Linhas:' })
    const jumpField = screen.getByRole('textbox', { name: 'Ir para página:' })

    expect(sizeSelect).toHaveValue('10')
    expect(jumpField).toHaveValue('')
    expect(pageButtonLabels()).toEqual(['1', '2', '3'])
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('button', { name: 'Página 2' })
    ).not.toHaveAttribute('aria-current')

    expectInDocumentOrder([
      screen.getByText('Linhas:'),
      sizeSelect,
      screen.getByText('1-10 de 300 itens'),
      screen.getByRole('button', { name: 'Primeira página' }),
      screen.getByRole('button', { name: 'Página anterior' }),
      screen.getByRole('button', { name: 'Página 1' }),
      screen.getByRole('button', { name: 'Página 2' }),
      screen.getByRole('button', { name: 'Página 3' }),
      screen.getByRole('button', { name: 'Próxima página' }),
      screen.getByRole('button', { name: 'Última página' }),
      screen.getByText('Ir para página:'),
      jumpField
    ])
  })

  it('C2 partial last page', () => {
    renderPaginator({ page: 30, totalItems: 295 })

    expect(screen.getByText('291-295 de 295 itens')).toBeInTheDocument()
    expect(pageButtonLabels()).toEqual(['28', '29', '30'])
    expect(screen.getByRole('button', { name: 'Página 30' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('C3 singular counter', () => {
    renderPaginator({ totalItems: 1 })

    expect(screen.getByText('1-1 de 1 item')).toBeInTheDocument()
  })

  it('C4 design tokens', () => {
    renderPaginator()

    const current = screen.getByRole('button', { name: 'Página 1' })
    const other = screen.getByRole('button', { name: 'Página 2' })

    expect(current).toHaveClass(
      'min-w-8',
      'rounded-lg',
      'inset-ring',
      'inset-ring-neutral-999',
      'text-primary'
    )
    expect(current).not.toHaveClass('text-neutral-83')
    expect(other).toHaveClass('min-w-8', 'rounded-lg', 'text-primary')
    expect(other).not.toHaveClass('inset-ring-neutral-999')

    const navIcons = [
      ['Primeira página', 'first_page'],
      ['Página anterior', 'chevron_left'],
      ['Próxima página', 'chevron_right'],
      ['Última página', 'last_page']
    ] as const

    navIcons.forEach(([name, icon]) => {
      const button = screen.getByRole('button', { name })
      expect(button).toHaveClass('p-2', 'rounded-lg', 'bg-neutral-alpha/10')
      expect(button).toHaveTextContent(icon)
      expect(within(button).getByText(icon)).toHaveClass('text-icon-18!')
    })
    ;['Linhas:', 'Ir para página:', '1-10 de 300 itens'].forEach(text => {
      expect(screen.getByText(text)).toHaveClass(
        'text-size-25',
        'text-secondary'
      )
    })

    const sizeSelect = screen.getByRole('combobox', { name: 'Linhas:' })
    const selectBox = sizeSelect.parentElement

    expect(selectBox).toHaveClass('w-17', 'h-8', 'rounded-lg', 'border-control')
    expect(selectBox).toHaveTextContent('keyboard_arrow_down')
    expect(
      screen.getByRole('textbox', { name: 'Ir para página:' }).parentElement
    ).toHaveClass('w-17', 'h-8', 'rounded-lg')
  })

  it('C5 accessible names', () => {
    renderPaginator()

    expect(screen.getByRole('navigation', { name: 'Paginação' }).tagName).toBe(
      'NAV'
    )
    expect(screen.getByLabelText('Linhas:').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Ir para página:').tagName).toBe('INPUT')
    ;['Página 1', 'Página 2', 'Página 3'].forEach(name => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('C6 navigation buttons', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPaginator({ page: 5 })

    await user.click(screen.getByRole('button', { name: 'Primeira página' }))
    await user.click(screen.getByRole('button', { name: 'Página anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    await user.click(screen.getByRole('button', { name: 'Última página' }))

    expect(onPageChange.mock.calls).toEqual([[1], [4], [6], [30]])
  })

  it('C7 page buttons', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPaginator()

    await user.click(screen.getByRole('button', { name: 'Página 1' }))
    expect(onPageChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(onPageChange.mock.calls).toEqual([[2]])
  })

  it('C8 disabled at the edges', async () => {
    const user = userEvent.setup()
    const first = renderPaginator()

    const startButtons = ['Primeira página', 'Página anterior'].map(name =>
      screen.getByRole('button', { name })
    )
    startButtons.forEach(button => expect(button).toBeDisabled())
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled()
    for (const button of startButtons) await user.click(button)
    expect(first.onPageChange).not.toHaveBeenCalled()
    first.unmount()

    const last = renderPaginator({ page: 30 })
    const endButtons = ['Próxima página', 'Última página'].map(name =>
      screen.getByRole('button', { name })
    )
    endButtons.forEach(button => expect(button).toBeDisabled())
    expect(
      screen.getByRole('button', { name: 'Página anterior' })
    ).toBeEnabled()
    for (const button of endButtons) await user.click(button)
    expect(last.onPageChange).not.toHaveBeenCalled()
  })

  it.each([
    [15, 300, ['14', '15', '16']],
    [1, 300, ['1', '2', '3']],
    [30, 300, ['28', '29', '30']],
    [1, 20, ['1', '2']]
  ])('C9 page window: page %i of %i items', (page, totalItems, expected) => {
    renderPaginator({ page, totalItems })

    expect(pageButtonLabels()).toEqual(expected)
  })

  it('C10 jump to page', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPaginator()
    const field = screen.getByRole('textbox', { name: 'Ir para página:' })

    await user.type(field, '1{Enter}')
    expect(onPageChange).not.toHaveBeenCalled()

    await user.clear(field)
    await user.type(field, '17{Enter}')
    expect(onPageChange.mock.calls).toEqual([[17]])
    expect(field).toHaveValue('')
  })

  it('C11 jump field threshold', () => {
    const six = renderPaginator({ totalItems: 60 })
    expect(screen.getByText('Ir para página:')).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Ir para página:' })
    ).toBeInTheDocument()
    six.unmount()

    renderPaginator({ totalItems: 50 })
    expect(screen.queryByText('Ir para página:')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it.each(['0', '31', '2.5', 'abc', ''])(
    'C12 invalid jump input: "%s"',
    async value => {
      const user = userEvent.setup()
      const { onPageChange } = renderPaginator()
      const field = screen.getByRole('textbox', { name: 'Ir para página:' })

      if (value !== '') await user.type(field, value)
      await user.type(field, '{Enter}')

      expect(onPageChange).not.toHaveBeenCalled()
      expect(field).toHaveAttribute('aria-invalid', 'true')

      await user.type(field, '5')
      expect(field).not.toHaveAttribute('aria-invalid')
    }
  )

  it('C13 page size options', async () => {
    const user = userEvent.setup()
    const { onPageChange, onPageSizeChange } = renderPaginator()
    const select = screen.getByRole('combobox', { name: 'Linhas:' })

    expect(
      within(select)
        .getAllByRole('option')
        .map(option => option.textContent)
    ).toEqual(['10', '25', '50', '100'])

    await user.selectOptions(select, '25')

    expect(onPageSizeChange.mock.calls).toEqual([[25]])
    expect(onPageChange.mock.calls).toEqual([[1]])
  })

  it('C14 page size outside the options', () => {
    renderPaginator({ pageSize: 15, pageSizeOptions: [10, 20, 50] })
    const select = screen.getByRole('combobox', { name: 'Linhas:' })

    expect(select).toHaveValue('15')
    expect(
      within(select)
        .getAllByRole('option')
        .map(option => option.textContent)
    ).toEqual(['10', '15', '20', '50'])
  })

  it('C15 empty list', () => {
    renderPaginator({ totalItems: 0 })

    expect(screen.getByText('0-0 de 0 itens')).toBeInTheDocument()
    expect(pageButtonLabels()).toEqual(['1'])
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    ;[
      'Primeira página',
      'Página anterior',
      'Próxima página',
      'Última página'
    ].forEach(name => {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    })
    expect(screen.getByRole('combobox', { name: 'Linhas:' })).toBeEnabled()
  })

  it('C16 out-of-range props', () => {
    const above = renderPaginator({ page: 40 })
    expect(screen.getByText('291-300 de 300 itens')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 30' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(above.onPageChange).not.toHaveBeenCalled()
    above.unmount()

    const below = renderPaginator({ page: 0 })
    expect(screen.getByText('1-10 de 300 itens')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(below.onPageChange).not.toHaveBeenCalled()
    below.unmount()

    const { container } = renderPaginator({ pageSize: 0 })
    expect(screen.getByText('0 itens')).toBeInTheDocument()
    expect(pageButtonLabels()).toEqual([])
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    ;[
      'Primeira página',
      'Página anterior',
      'Próxima página',
      'Última página'
    ].forEach(name => {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    })
    expect(screen.getByRole('combobox', { name: 'Linhas:' })).toBeEnabled()
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('C17 stories', async () => {
    const user = userEvent.setup()

    expect(meta.parameters?.design?.url).toContain('node-id=13607-2572')

    expect(WithTable.render).toBeDefined()
    render(<PaginatedTableExample />)
    await user.click(screen.getByRole('button', { name: 'Página 2' }))

    expect(screen.getByText('11-20 de 30 itens')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('Membro fictício 11')).toBeInTheDocument()
    expect(within(table).getByText('Membro fictício 20')).toBeInTheDocument()
    expect(
      within(table).queryByText('Membro fictício 10')
    ).not.toBeInTheDocument()
    expect(
      within(table).queryByText('Membro fictício 21')
    ).not.toBeInTheDocument()
  })

  describe('Lamb alignment (C39, C40)', () => {
    it('range pt-BR: formatted in a polite live region inside the root', () => {
      renderPaginator({ page: 1, totalItems: 1284 })
      const range = screen.getByText('1-10 de 1.284 itens')
      const root = screen.getByRole('navigation')

      expect(range).toHaveAttribute('aria-live', 'polite')
      expect(root).toHaveClass(
        'gap-6',
        'flex-wrap',
        'font-normal',
        'text-size-25',
        'text-secondary'
      )
    })

    it('page size defaults: 10, 25, 50 and 100', () => {
      renderPaginator()

      expect(
        within(screen.getByRole('combobox', { name: 'Linhas:' }))
          .getAllByRole('option')
          .map(option => option.textContent)
      ).toEqual(['10', '25', '50', '100'])
    })

    it('button appearance: page, navigation and size select', () => {
      renderPaginator()

      const current = screen.getByRole('button', { name: 'Página 1' })
      const other = screen.getByRole('button', { name: 'Página 2' })
      ;[current, other].forEach(button => {
        expect(button).toHaveClass('h-8', 'min-w-8', 'px-2', 'py-0')
        expect(button).toHaveClass('text-primary')
        expect(within(button).getByText(button.textContent ?? '')).toHaveClass(
          'font-medium',
          'text-size-50'
        )
      })
      expect(current).toHaveClass('inset-ring', 'inset-ring-neutral-999')
      expect(other).not.toHaveClass('inset-ring-neutral-999')

      const enabled = screen.getByRole('button', { name: 'Próxima página' })
      expect(enabled).toHaveClass(
        'bg-neutral-alpha/10',
        'not-disabled:hover:bg-neutral-alpha/20'
      )
      expect(within(enabled).getByText('chevron_right')).toHaveClass(
        'text-icon-18!'
      )

      const disabled = screen.getByRole('button', { name: 'Primeira página' })
      expect(disabled).toBeDisabled()
      expect(disabled).toHaveClass(
        'disabled:bg-transparent',
        'disabled:text-disabled'
      )
      expect(disabled).not.toHaveClass('disabled:bg-disabled')

      const select = screen.getByRole('combobox', { name: 'Linhas:' })
      expect(select.parentElement).toHaveClass('border-control')
      expect(select).toHaveClass('text-primary')
    })

    it('nav label: defaults to "Paginação" and follows the label prop', () => {
      const { unmount } = renderPaginator()
      expect(
        screen.getByRole('navigation', { name: 'Paginação' })
      ).toBeInTheDocument()
      unmount()

      renderPaginator({ label: 'Paginação de membros' })
      expect(
        screen.getByRole('navigation', { name: 'Paginação de membros' })
      ).toBeInTheDocument()
    })

    it('empty total: shows "0-0 de 0 itens" and page 1', async () => {
      const user = userEvent.setup()
      const { onPageChange } = renderPaginator({ totalItems: 0 })

      expect(screen.getByText('0-0 de 0 itens')).toBeInTheDocument()
      expect(pageButtonLabels()).toEqual(['1'])
      expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
        'aria-current',
        'page'
      )

      await user.click(screen.getByRole('button', { name: 'Página 1' }))
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })
})
