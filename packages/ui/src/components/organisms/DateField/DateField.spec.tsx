import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { useForm } from 'react-hook-form'
import { toISO } from '@church/ui/molecules/DatePicker'
import { Dialog } from '@church/ui/organisms/Dialog'
import { APP_MEDIA_QUERY } from '@church/ui/utils'
import { DateField, DateFieldProps } from '.'

// why: jsdom loads no Tailwind CSS and has no layout, so these specs assert
// the utility classes requested and the real DOM semantics.
let narrow = false

const mediaQueryList = (query: string): MediaQueryList => ({
  get matches() {
    return narrow && query === APP_MEDIA_QUERY
  },
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn(() => false)
})

const matchMedia = jest.fn(mediaQueryList)

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: matchMedia,
    writable: true
  })
})

beforeEach(() => {
  narrow = false
  matchMedia.mockClear()
})

afterEach(() => {
  document.body.style.overflow = ''
})

const LABEL = 'Data da reunião'

const renderField = (props: Partial<DateFieldProps> = {}) =>
  render(<DateField label={LABEL} {...props} />)

const inputOf = () => screen.getByRole('textbox')
const buttonOf = (name = `Abrir calendário de ${LABEL}`) =>
  screen.getByRole('button', { name })
const popoverOf = (name = `Escolher ${LABEL}`) =>
  screen.getByRole('dialog', { name })
const helperOf = () => {
  const id = inputOf().getAttribute('aria-describedby') ?? ''
  const helper = document.getElementById(id)
  if (!helper) throw new Error('no helper text')
  return helper
}
// invariant: the message span, without the state icon's glyph text.
const messageOf = () => helperOf().lastElementChild
const dayOf = (day: number, month: string, year = 2026) =>
  screen.getByRole('button', {
    name: new RegExp(`^[^,]+, ${day} de ${month} de ${year}(,|$)`)
  })

const isCalendarSheet = () =>
  screen.getByRole('dialog', { name: LABEL }).getAttribute('aria-modal') ===
    'true' &&
  screen.queryByRole('dialog', { name: `Escolher ${LABEL}` }) === null
const isCalendarPopover = () =>
  !popoverOf().hasAttribute('aria-modal') &&
  screen.queryByRole('dialog', { name: LABEL }) === null

describe('DateField', () => {
  it('auto presentation (C1)', async () => {
    const user = userEvent.setup()

    const wide = renderField()
    await user.click(buttonOf())
    expect(isCalendarPopover()).toBe(true)
    wide.unmount()

    narrow = true
    const narrowWindow = renderField()
    await user.click(buttonOf())
    expect(isCalendarSheet()).toBe(true)
    narrowWindow.unmount()

    const desktop = render(
      <div data-viewport="desktop">
        <DateField label={LABEL} />
      </div>
    )
    await user.click(buttonOf())
    expect(isCalendarPopover()).toBe(true)
    desktop.unmount()

    narrow = false
    render(
      <div data-viewport="mobile">
        <DateField label={LABEL} />
      </div>
    )
    await user.click(buttonOf())
    expect(isCalendarSheet()).toBe(true)
  })

  it('closed markup ignores the viewport (C2)', () => {
    const tree = (
      <DateField
        defaultValue="2026-03-15"
        helperText="Use a data do encontro."
        label={LABEL}
      />
    )

    narrow = true
    const narrowHtml = renderToString(tree)
    narrow = false
    const wideHtml = renderToString(tree)
    render(tree)

    expect(narrowHtml).toBe(wideHtml)
    expect(matchMedia).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('forced presentation (C3)', async () => {
    const user = userEvent.setup()
    narrow = true

    const popover = render(
      <div data-viewport="mobile">
        <DateField label={LABEL} presentation="popover" />
      </div>
    )
    await user.click(buttonOf())
    expect(popoverOf()).not.toHaveAttribute('aria-modal')
    popover.unmount()

    narrow = false
    render(
      <div data-viewport="desktop">
        <DateField label={LABEL} presentation="sheet" />
      </div>
    )
    await user.click(buttonOf())
    expect(screen.getByRole('dialog', { name: LABEL })).toHaveAttribute(
      'aria-modal',
      'true'
    )
    expect(screen.queryByRole('dialog', { name: `Escolher ${LABEL}` })).toBe(
      null
    )
  })

  it('field markup (C24)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderField()
    const input = screen.getByLabelText(LABEL)
    const button = buttonOf()

    expect(input).toBe(inputOf())
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('placeholder', 'dd/mm/aaaa')
    expect(input).toHaveAttribute('maxlength', '10')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(input.parentElement).toHaveClass('h-12', 'border-control')
    expect(input.parentElement).toContainElement(button)
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveClass('size-8', '-m-1')
    expect(button).toHaveTextContent('calendar_month')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    unmount()

    const unlabelled = render(<DateField />)
    expect(buttonOf('Abrir calendário')).toBeInTheDocument()
    unlabelled.unmount()

    const small = renderField({ size: 'small' })
    expect(inputOf().parentElement).toHaveClass('h-8')
    small.unmount()

    const large = renderField({ optional: true, size: 'large' })
    expect(inputOf().parentElement).toHaveClass('h-14')
    expect(screen.getByText('(Opcional)')).toBeInTheDocument()
    expect(inputOf()).not.toHaveAttribute('aria-required')
    large.unmount()

    renderField({ disabled: true })
    expect(inputOf()).toBeDisabled()
    expect(buttonOf()).toBeDisabled()
  })

  it('format hint (C25)', () => {
    const { unmount } = renderField({ helperText: 'Use a data do encontro.' })

    expect(helperOf().tagName).toBe('P')
    expect(helperOf()).toHaveTextContent(
      'Use a data do encontro. Formato dd/mm/aaaa.'
    )
    expect(inputOf()).toHaveAccessibleDescription(
      'Use a data do encontro. Formato dd/mm/aaaa.'
    )
    unmount()

    renderField()
    expect(messageOf()).toHaveTextContent(/^Formato dd\/mm\/aaaa\.$/)
    expect(inputOf()).toHaveAccessibleDescription('Formato dd/mm/aaaa.')
  })

  it('mask (C26)', async () => {
    const user = userEvent.setup()
    renderField()
    const input = inputOf()

    await user.type(input, '1503')
    expect(input).toHaveValue('15/03')

    await user.clear(input)
    await user.type(input, '15032026')
    expect(input).toHaveValue('15/03/2026')

    await user.clear(input)
    await user.type(input, 'ab15-0x3')
    expect(input).toHaveValue('15/03')
    await user.type(input, '2026999')
    expect(input).toHaveValue('15/03/2026')
  })

  it('validation messages (C27)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const disabledDates = (iso: string) =>
      iso === '2026-04-21' ? 'Feriado' : iso === '2026-04-22'
    const cases: [string, boolean, string][] = [
      ['1503', true, 'Data incompleta. Use dd/mm/aaaa.'],
      ['31022026', false, 'Essa data não existe. Confira dia e mês.'],
      ['31122025', false, 'Antes de 01/01/2026, a primeira data permitida.'],
      ['01012027', false, 'Depois de 31/12/2026, a última data permitida.'],
      ['21042026', false, 'Feriado.'],
      ['22042026', false, 'Data indisponível.']
    ]

    for (const [typed, blur, message] of cases) {
      const { unmount } = renderField({
        disabledDates,
        max: '2026-12-31',
        min: '2026-01-01',
        onChange
      })
      await user.type(inputOf(), typed)
      if (blur) await user.tab()

      expect(helperOf()).toHaveTextContent(message)
      expect(helperOf()).toHaveClass('text-danger')
      expect(inputOf()).toHaveAttribute('aria-invalid', 'true')
      expect(inputOf().parentElement).toHaveClass('border-red-67')
      unmount()
    }
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commit (C28)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { unmount } = renderField({ onChange })
    const input = inputOf()

    await user.type(input, '1503')
    await user.tab()
    expect(helperOf()).toHaveTextContent('Data incompleta. Use dd/mm/aaaa.')

    await user.type(input, '2026')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('2026-03-15')
    expect(messageOf()).toHaveTextContent(/^Formato dd\/mm\/aaaa\.$/)
    expect(input).not.toHaveAttribute('aria-invalid')
    await user.tab()
    expect(onChange).toHaveBeenCalledTimes(1)

    await user.clear(input)
    await user.type(input, '31022026')
    expect(helperOf()).toHaveTextContent('Essa data não existe.')
    await user.type(input, '{Backspace}')
    expect(input).toHaveValue('31/02/202')
    expect(messageOf()).toHaveTextContent(/^Formato dd\/mm\/aaaa\.$/)
    expect(input).not.toHaveAttribute('aria-invalid')
    unmount()

    const cleared = jest.fn()
    renderField({ defaultValue: '2026-03-15', onChange: cleared })
    await user.clear(inputOf())
    expect(cleared).not.toHaveBeenCalled()
    await user.tab()
    expect(cleared).toHaveBeenCalledTimes(1)
    expect(cleared).toHaveBeenCalledWith(null)
  })

  it('external error wins (C29)', async () => {
    const user = userEvent.setup()
    renderField({ helperText: 'Informe a data.', state: 'error' })

    expect(messageOf()).toHaveTextContent(/^Informe a data\.$/)
    await user.type(inputOf(), '1503')
    await user.tab()

    expect(messageOf()).toHaveTextContent(/^Informe a data\.$/)
    expect(helperOf()).not.toHaveTextContent('Data incompleta')
    expect(helperOf()).toHaveClass('text-danger')
    expect(inputOf()).toHaveAttribute('aria-invalid', 'true')
  })

  it('controlled and uncontrolled (C30)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { rerender, unmount } = render(
      <DateField label={LABEL} onChange={onChange} value="2026-03-15" />
    )
    expect(inputOf()).toHaveValue('15/03/2026')

    rerender(<DateField label={LABEL} onChange={onChange} value="2026-04-01" />)
    expect(inputOf()).toHaveValue('01/04/2026')

    rerender(<DateField label={LABEL} onChange={onChange} value={null} />)
    expect(inputOf()).toHaveValue('')

    await user.type(inputOf(), '20052026')
    expect(onChange).toHaveBeenCalledWith('2026-05-20')
    unmount()

    const own = jest.fn()
    render(<DateField defaultValue="2026-03-15" label={LABEL} onChange={own} />)
    expect(inputOf()).toHaveValue('15/03/2026')
    await user.clear(inputOf())
    await user.type(inputOf(), '01062026')
    expect(own).toHaveBeenCalledWith('2026-06-01')

    await user.click(buttonOf())
    expect(
      within(popoverOf()).getByRole('button', { name: /, 1 de junho de 2026/ })
    ).toHaveAttribute('tabindex', '0')
  })

  it('calendar popover (C31)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderField({
      defaultValue: '2026-03-15',
      disabledDates: iso => (iso === '2026-03-20' ? 'Feriado' : false),
      max: '2026-03-28',
      min: '2026-03-02',
      shortcuts: ['today'],
      yearRange: [2020, 2030]
    })

    await user.click(buttonOf())
    const popover = popoverOf()
    const anchor = popover.parentElement

    expect(popover).toHaveClass(
      'absolute',
      'top-full',
      'left-0',
      'mt-1',
      'z-30',
      'p-4',
      'rounded-2xl',
      'bg-surface',
      'border',
      'border-default',
      'shadow-elevation-low-bottom-12'
    )
    expect(anchor).toHaveClass('relative')
    expect(anchor?.firstElementChild).toContainElement(inputOf())
    expect(within(popover).getByRole('group', { name: LABEL })).toBeVisible()
    expect(dayOf(15, 'março')).toHaveFocus()
    expect(dayOf(15, 'março').closest('td')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(dayOf(1, 'março')).toHaveAttribute('aria-disabled', 'true')
    expect(dayOf(1, 'março')).toHaveAccessibleName(
      /, 1 de março de 2026, indisponível: Antes de 02\/03\/2026, a primeira data permitida$/
    )
    expect(dayOf(28, 'março')).not.toHaveAttribute('aria-disabled')
    expect(dayOf(29, 'março')).toHaveAttribute('aria-disabled', 'true')
    expect(dayOf(29, 'março')).toHaveAccessibleName(
      /, 29 de março de 2026, indisponível: Depois de 28\/03\/2026, a última data permitida$/
    )
    expect(dayOf(20, 'março')).toHaveAttribute('aria-disabled', 'true')
    expect(dayOf(20, 'março')).toHaveAccessibleName(
      /, 20 de março de 2026, indisponível: Feriado$/
    )
    expect(
      within(popover).getByRole('button', { name: 'Hoje' })
    ).toBeInTheDocument()
    const years = within(
      within(popover).getByRole('combobox', { name: 'Ano' })
    ).getAllByRole('option')
    expect(years.map(option => option.textContent)).toEqual(
      Array.from({ length: 11 }, (_, index) => String(2030 - index))
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    inputOf().focus()
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(popoverOf()).toBeInTheDocument()
    expect(dayOf(15, 'março')).toHaveFocus()
    unmount()

    const controlled = renderField({ value: '2026-03-10' })
    await user.click(buttonOf())
    expect(dayOf(10, 'março')).toHaveFocus()
    expect(dayOf(10, 'março').closest('td')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(dayOf(15, 'março').closest('td')).toHaveAttribute(
      'aria-selected',
      'false'
    )
    controlled.unmount()

    render(<DateField />)
    await user.click(buttonOf('Abrir calendário'))
    expect(popoverOf('Escolher data')).toBeInTheDocument()
  })

  it('pick a day (C32)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderField({ defaultValue: '2026-03-15', onChange, shortcuts: ['today'] })

    await user.click(buttonOf())
    await user.click(dayOf(20, 'março'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('2026-03-20')
    expect(inputOf()).toHaveValue('20/03/2026')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(buttonOf()).toHaveFocus())

    const today = new Date()
    await user.click(buttonOf())
    await user.click(within(popoverOf()).getByRole('button', { name: 'Hoje' }))
    expect(onChange).toHaveBeenLastCalledWith(toISO(today))
    expect(inputOf()).toHaveValue(
      today.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(buttonOf()).toHaveFocus())
  })

  it('close the calendar (C33)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <>
        <DateField defaultValue="2026-03-15" label={LABEL} />
        <button type="button">Fora</button>
      </>
    )

    await user.click(buttonOf())
    expect(dayOf(15, 'março')).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(buttonOf()).toHaveFocus())

    await user.click(buttonOf())
    expect(popoverOf()).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fora' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Fora' })).toHaveFocus()
    unmount()

    const onClose = jest.fn()
    render(
      <Dialog onClose={onClose} open title="Editar reunião">
        <DateField defaultValue="2026-03-15" label={LABEL} />
      </Dialog>
    )
    await waitFor(() => expect(inputOf()).toHaveFocus())
    await user.click(buttonOf())
    expect(popoverOf()).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: `Escolher ${LABEL}` })
    ).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await waitFor(() => expect(buttonOf()).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sheet presentation (C34)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { unmount } = renderField({
      defaultValue: '2026-03-15',
      onChange,
      presentation: 'sheet'
    })

    await user.click(buttonOf())
    const sheet = screen.getByRole('dialog', { name: LABEL })
    const picker = within(sheet).getByRole('group', { name: LABEL })
    const day = dayOf(20, 'março')

    expect(sheet).toHaveAttribute('aria-modal', 'true')
    expect(picker).toHaveClass('max-w-none')
    expect(picker).not.toHaveClass('max-w-84')
    expect(day).toHaveClass('size-11')
    expect(day.closest('[data-viewport]')).toHaveAttribute(
      'data-viewport',
      'mobile'
    )
    expect(sheet).toContainElement(day.closest('[data-viewport]'))

    await user.click(day)
    expect(onChange).toHaveBeenCalledWith('2026-03-20')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(buttonOf()).toHaveFocus())

    inputOf().focus()
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(screen.getByRole('dialog', { name: LABEL })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(buttonOf()).toHaveFocus())
    expect(onChange).toHaveBeenCalledTimes(1)
    unmount()

    render(<DateField presentation="sheet" />)
    await user.click(buttonOf('Abrir calendário'))
    expect(
      screen.getByRole('dialog', { name: 'Escolher data' })
    ).toHaveAttribute('aria-modal', 'true')
  })

  it('react-hook-form (C35)', async () => {
    const user = userEvent.setup()
    type Form = { data: string | null }
    const Harness = () => {
      const form = useForm<Form>({ defaultValues: { data: '2026-03-15' } })
      return (
        <form onSubmit={form.handleSubmit(() => undefined)}>
          <DateField
            control={form.control}
            label={LABEL}
            name="data"
            rules={{ required: 'Informe a data.' }}
          />
          <output data-testid="value">
            {JSON.stringify(form.watch('data'))}
          </output>
          <output data-testid="touched">
            {form.formState.touchedFields.data ? 'tocado' : 'intocado'}
          </output>
          <button type="submit">Salvar</button>
        </form>
      )
    }
    const valueInForm = () => screen.getByTestId('value').textContent
    render(<Harness />)

    expect(inputOf()).toHaveValue('15/03/2026')
    expect(screen.getByTestId('touched')).toHaveTextContent('intocado')

    await user.clear(inputOf())
    await user.type(inputOf(), '31022026')
    expect(valueInForm()).toBe('"2026-03-15"')
    await user.type(inputOf(), '{Backspace}')
    await user.tab()
    expect(valueInForm()).toBe('"2026-03-15"')
    expect(screen.getByTestId('touched')).toHaveTextContent('tocado')

    await user.clear(inputOf())
    await user.type(inputOf(), '20052026')
    expect(valueInForm()).toBe('"2026-05-20"')

    await user.clear(inputOf())
    await user.tab()
    expect(valueInForm()).toBe('null')

    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() =>
      expect(messageOf()).toHaveTextContent(/^Informe a data\.$/)
    )
    expect(helperOf()).toHaveClass('text-danger')
    expect(inputOf()).toHaveAttribute('aria-invalid', 'true')

    await user.type(inputOf(), '1503')
    await user.tab()
    expect(messageOf()).toHaveTextContent(/^Informe a data\.$/)
  })
})
