import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { DatePicker } from './DatePicker'
import type { DateRange, ISODate } from './DatePicker.types'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics; "today" is pinned to 2026-10-08.
beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 9, 8, 12) })
})

afterEach(() => {
  jest.useRealTimers()
})

const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

const dayOf = (day: number, month = 'outubro', year = 2026) =>
  screen.getByRole('button', {
    name: new RegExp(`^[^,]+, ${day} de ${month} de ${year}(,|$)`)
  })

const cellOf = (day: number) => {
  const cell = dayOf(day).closest('td')
  if (!cell) throw new Error(`no cell for day ${day}`)
  return cell
}

const gridName = () => {
  const grid = screen.getByRole('grid')
  const id = grid.getAttribute('aria-labelledby') ?? ''
  return document.getElementById(id)?.textContent
}

const tabbableDays = () =>
  within(screen.getByRole('grid'))
    .getAllByRole('button')
    .filter(button => button.getAttribute('tabindex') === '0')

const RangeHarness = ({
  onChange
}: {
  onChange: (value: DateRange) => void
}) => {
  const [value, setValue] = useState<DateRange | null>(null)
  return (
    <DatePicker
      initialMonth="2026-10-01"
      mode="range"
      onChange={next => {
        onChange(next)
        setValue(next)
      }}
      value={value}
    />
  )
}

describe('DatePicker', () => {
  it('month grid (C85)', () => {
    render(<DatePicker initialMonth="2026-10-01" />)
    const previous = screen.getByRole('button', { name: 'Mês anterior' })
    const next = screen.getByRole('button', { name: 'Próximo mês' })
    const month = screen.getByRole('combobox', { name: 'Mês' })
    const year = screen.getByRole('combobox', { name: 'Ano' })
    const grid = screen.getByRole('grid', { name: 'outubro de 2026' })
    const caption = document.getElementById(
      grid.getAttribute('aria-labelledby') ?? ''
    )
    const headers = within(grid).getAllByRole('columnheader')
    const [firstWeek] = within(grid).getAllByRole('row').slice(1)

    expect(grid.tagName).toBe('TABLE')
    expect(month).toHaveDisplayValue('Outubro')
    expect(year).toHaveDisplayValue('2026')
    const head = previous.parentElement
    expect(head?.firstElementChild).toBe(previous)
    expect(head?.lastElementChild).toBe(next)
    expect(
      previous.compareDocumentPosition(month) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      year.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(caption).toHaveAttribute('aria-live', 'polite')
    expect(caption).toHaveTextContent('outubro de 2026')
    expect(headers.map(header => header.textContent)).toEqual([
      'dom',
      'seg',
      'ter',
      'qua',
      'qui',
      'sex',
      'sáb'
    ])
    expect(headers.map(header => header.getAttribute('abbr'))).toEqual([
      'domingo',
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado'
    ])
    const cells = Array.from(firstWeek?.children ?? [])
    expect(cells).toHaveLength(7)
    cells.slice(0, 4).forEach(cell => {
      expect(cell).toHaveAttribute('aria-hidden', 'true')
      expect(cell).toBeEmptyDOMElement()
    })
    expect(within(cells[4] as HTMLElement).getByRole('button')).toBe(dayOf(1))
    expect(dayOf(1)).toHaveAccessibleName('quinta-feira, 1 de outubro de 2026')
  })

  it('today (C86)', () => {
    render(<DatePicker />)
    const today = screen.getByRole('button', {
      name: 'quinta-feira, 8 de outubro de 2026, hoje'
    })
    const other = dayOf(9)

    expect(today).toHaveClass(
      'font-semibold',
      'inset-ring',
      'inset-ring-neutral-999',
      'after:absolute',
      'after:size-1',
      'after:rounded-full',
      'after:bg-current'
    )
    expect(other).toHaveAccessibleName('sexta-feira, 9 de outubro de 2026')
    expect(other).not.toHaveClass('font-semibold', 'inset-ring', 'after:size-1')
    expect(other).toHaveClass('font-normal')
  })

  it('day button (C87)', () => {
    render(<DatePicker initialMonth="2026-10-01" />)
    const day = dayOf(15)

    expect(day).toHaveAttribute('type', 'button')
    expect(day).toHaveClass(
      'rounded-full',
      'text-size-50',
      'font-normal',
      'tabular-nums',
      'size-11',
      'panel:not-in-data-[viewport=mobile]:size-10',
      'in-data-[viewport=desktop]:size-10',
      'hover:bg-hover',
      'active:bg-selected'
    )
  })

  it('single selection (C88)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const { rerender } = render(
      <DatePicker initialMonth="2026-10-01" onChange={onChange} />
    )

    await user.click(dayOf(15))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('2026-10-15')

    rerender(
      <DatePicker
        initialMonth="2026-10-01"
        onChange={onChange}
        value="2026-10-15"
      />
    )
    expect(dayOf(15)).toHaveClass(
      'bg-action-primary',
      'text-inverse',
      'font-semibold',
      'hover:bg-neutral-100'
    )
    expect(cellOf(15)).toHaveAttribute('aria-selected', 'true')
    expect(cellOf(16)).toHaveAttribute('aria-selected', 'false')
    expect(dayOf(16)).not.toHaveClass('bg-action-primary')
  })

  it('keyboard (C89)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const onCancel = jest.fn()
    const { unmount } = render(<DatePicker value="2026-10-15" />)
    expect(tabbableDays()).toEqual([dayOf(15)])
    unmount()

    const second = render(<DatePicker initialMonth="2026-10-01" />)
    expect(tabbableDays()).toEqual([dayOf(1)])
    second.unmount()

    render(<DatePicker onCancel={onCancel} onChange={onChange} />)
    expect(tabbableDays()).toEqual([dayOf(8)])
    act(() => dayOf(8).focus())

    const expectFocus = (day: number, month = 'outubro', year = 2026) => {
      expect(dayOf(day, month, year)).toHaveFocus()
      expect(tabbableDays()).toEqual([dayOf(day, month, year)])
    }

    await user.keyboard('{ArrowRight}')
    expectFocus(9)
    await user.keyboard('{ArrowLeft}')
    expectFocus(8)
    await user.keyboard('{ArrowDown}')
    expectFocus(15)
    await user.keyboard('{ArrowUp}')
    expectFocus(8)
    await user.keyboard('{Home}')
    expectFocus(4)
    await user.keyboard('{End}')
    expectFocus(10)
    await user.keyboard('{PageDown}')
    expect(gridName()).toBe('novembro de 2026')
    expectFocus(10, 'novembro')
    await user.keyboard('{PageUp}')
    expect(gridName()).toBe('outubro de 2026')
    expectFocus(10)
    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(gridName()).toBe('outubro de 2027')
    expectFocus(10, 'outubro', 2027)
    await user.keyboard('{Shift>}{PageUp}{/Shift}')
    expect(gridName()).toBe('outubro de 2026')
    expectFocus(10)

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    expectFocus(31)
    await user.keyboard('{ArrowRight}')
    expect(gridName()).toBe('novembro de 2026')
    expectFocus(1, 'novembro')
    await user.keyboard('{ArrowLeft}')
    expect(gridName()).toBe('outubro de 2026')
    expectFocus(31)

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith('2026-10-31')
    await user.keyboard('{ArrowLeft} ')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith('2026-10-30')

    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('min and max (C90)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const { rerender } = render(
      <DatePicker max="2026-10-20" min="2026-10-05" onChange={onChange} />
    )
    const before = dayOf(4)
    const after = dayOf(21)

    expect(before).toHaveAccessibleName(
      'domingo, 4 de outubro de 2026, indisponível: Antes de 05/10/2026, a primeira data permitida'
    )
    expect(after).toHaveAccessibleName(
      'quarta-feira, 21 de outubro de 2026, indisponível: Depois de 20/10/2026, a última data permitida'
    )
    ;[before, after].forEach(day => {
      expect(day).toHaveAttribute('aria-disabled', 'true')
      expect(day).toHaveClass('text-disabled', 'line-through')
      expect(day).not.toHaveClass('hover:bg-hover')
    })
    expect(dayOf(5)).not.toHaveAttribute('aria-disabled')
    expect(dayOf(20)).not.toHaveAttribute('aria-disabled')

    await user.click(before)
    await user.click(after)
    expect(onChange).not.toHaveBeenCalled()
    await user.click(dayOf(5))
    expect(onChange).toHaveBeenCalledWith('2026-10-05')

    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()

    rerender(
      <DatePicker max="2026-11-02" min="2026-09-30" onChange={onChange} />
    )
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeEnabled()
  })

  it('disabled dates (C91)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const disabledDates = (iso: ISODate) => {
      if (iso === '2026-10-13') return true
      return new Date(`${iso}T12:00`).getDay() === 0
        ? 'Domingo é dia de culto'
        : false
    }
    render(<DatePicker disabledDates={disabledDates} onChange={onChange} />)
    const sunday = dayOf(11)
    const tooltip = document.getElementById(
      sunday.getAttribute('aria-describedby') ?? ''
    )

    expect(sunday).toHaveAccessibleName(
      'domingo, 11 de outubro de 2026, indisponível: Domingo é dia de culto'
    )
    expect(sunday).toHaveAttribute('aria-disabled', 'true')
    expect(tooltip).toHaveAttribute('role', 'tooltip')
    expect(tooltip).toHaveTextContent('Domingo é dia de culto')
    expect(tooltip).toHaveAttribute('data-open', 'false')
    await user.hover(sunday)
    expect(tooltip).toHaveAttribute('data-open', 'true')

    expect(dayOf(13)).toHaveAccessibleName(
      'terça-feira, 13 de outubro de 2026, indisponível: Data indisponível'
    )
    expect(dayOf(12)).not.toHaveAttribute('aria-disabled')
    expect(dayOf(12)).not.toHaveAttribute('aria-describedby')

    await user.click(sunday)
    await user.click(dayOf(13))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('range selection (C92)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const { unmount } = render(<RangeHarness onChange={onChange} />)

    await user.click(dayOf(10))
    expect(onChange).toHaveBeenNthCalledWith(1, {
      end: null,
      start: '2026-10-10'
    })
    await user.click(dayOf(6))
    expect(onChange).toHaveBeenNthCalledWith(2, {
      end: '2026-10-10',
      start: '2026-10-06'
    })
    ;[6, 7, 8, 9, 10].forEach(day => {
      expect(cellOf(day)).toHaveClass('bg-selected')
      expect(cellOf(day)).toHaveAttribute('aria-selected', 'true')
    })
    ;[5, 11].forEach(day => {
      expect(cellOf(day)).not.toHaveClass('bg-selected')
      expect(cellOf(day)).toHaveAttribute('aria-selected', 'false')
    })
    expect(cellOf(6)).toHaveClass('rounded-l-full')
    expect(cellOf(6)).not.toHaveClass('rounded-r-full')
    expect(cellOf(10)).toHaveClass('rounded-r-full')
    expect(cellOf(10)).not.toHaveClass('rounded-l-full')
    expect(cellOf(8)).not.toHaveClass('rounded-l-full', 'rounded-r-full')
    expect(dayOf(6)).toHaveClass('bg-action-primary')
    expect(dayOf(10)).toHaveClass('bg-action-primary')
    expect(dayOf(8)).not.toHaveClass('bg-action-primary')
    unmount()

    render(
      <DatePicker
        initialMonth="2026-10-01"
        mode="range"
        value={{ end: null, start: '2026-10-10' }}
      />
    )
    await user.hover(dayOf(13))
    ;[10, 11, 12, 13].forEach(day =>
      expect(cellOf(day)).toHaveClass('bg-selected')
    )
    expect(cellOf(14)).not.toHaveClass('bg-selected')
    expect(cellOf(10)).toHaveClass('rounded-l-full')
    expect(cellOf(13)).toHaveClass('rounded-r-full')

    fireEvent.mouseLeave(screen.getByRole('grid'))
    expect(cellOf(11)).not.toHaveClass('bg-selected')
    expect(cellOf(10)).toHaveClass('bg-selected')
  })

  it('shortcuts (C93)', async () => {
    const user = setup()
    const onChange = jest.fn()
    const { rerender } = render(
      <DatePicker
        initialMonth="2026-08-01"
        onChange={onChange}
        shortcuts={['today', 'yesterday']}
      />
    )
    const today = screen.getByRole('button', { name: 'Hoje' })
    const yesterday = screen.getByRole('button', { name: 'Ontem' })
    const row = today.parentElement

    expect(row).toBe(yesterday.parentElement)
    expect(row).toHaveClass('border-t', 'border-default', 'gap-2', 'pt-2')
    expect(
      screen.getByRole('grid').compareDocumentPosition(today) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()

    expect(gridName()).toBe('agosto de 2026')
    await user.click(today)
    expect(onChange).toHaveBeenLastCalledWith('2026-10-08')
    expect(gridName()).toBe('outubro de 2026')
    await user.click(yesterday)
    expect(onChange).toHaveBeenLastCalledWith('2026-10-07')

    rerender(
      <DatePicker
        min="2026-10-08"
        onChange={onChange}
        shortcuts={['today', 'yesterday']}
      />
    )
    expect(screen.getByRole('button', { name: 'Ontem' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hoje' })).toBeEnabled()

    rerender(<DatePicker mode="range" shortcuts={['today', 'yesterday']} />)
    expect(
      screen.queryByRole('button', { name: 'Hoje' })
    ).not.toBeInTheDocument()
  })

  it('month and year selects (C94)', async () => {
    const user = setup()
    const { rerender } = render(<DatePicker initialMonth="2026-10-01" />)
    const month = screen.getByRole('combobox', { name: 'Mês' })
    const year = screen.getByRole('combobox', { name: 'Ano' })
    const yearsOf = () =>
      within(screen.getByRole('combobox', { name: 'Ano' }))
        .getAllByRole('option')
        .map(option => Number(option.textContent))

    expect(
      within(month)
        .getAllByRole('option')
        .map(option => option.textContent)
    ).toEqual([
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ])

    await user.selectOptions(month, 'Março')
    expect(gridName()).toBe('março de 2026')
    await user.selectOptions(year, '2020')
    expect(gridName()).toBe('março de 2020')
    expect(dayOf(1, 'março', 2020)).toBeInTheDocument()

    const defaults = yearsOf()
    expect(defaults[0]).toBe(2031)
    expect(defaults.at(-1)).toBe(1926)
    expect(defaults).toHaveLength(106)

    rerender(<DatePicker initialMonth="2026-10-01" yearRange={[2020, 2030]} />)
    expect(yearsOf()).toEqual([
      2030, 2029, 2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020
    ])

    rerender(
      <DatePicker initialMonth="2026-10-01" max="2027-12-31" min="2024-01-01" />
    )
    expect(yearsOf()).toEqual([2027, 2026, 2025, 2024])
  })

  it('invalid iso is ignored (C95)', () => {
    const { rerender } = render(
      <DatePicker max="20/10/2026" min="2026-13-01" value="2026-02-31" />
    )

    expect(gridName()).toBe('outubro de 2026')
    expect(tabbableDays()).toEqual([dayOf(8)])
    expect(
      within(screen.getByRole('grid'))
        .getAllByRole('gridcell')
        .filter(cell => cell.getAttribute('aria-selected') === 'true')
    ).toHaveLength(0)
    expect(
      within(screen.getByRole('grid'))
        .getAllByRole('button')
        .filter(button => button.hasAttribute('aria-disabled'))
    ).toHaveLength(0)

    rerender(
      <DatePicker mode="range" value={{ end: 'amanhã', start: 'ontem' }} />
    )
    expect(gridName()).toBe('outubro de 2026')
    expect(
      within(screen.getByRole('grid'))
        .getAllByRole('gridcell')
        .filter(cell => cell.getAttribute('aria-selected') === 'true')
    ).toHaveLength(0)
  })
})
