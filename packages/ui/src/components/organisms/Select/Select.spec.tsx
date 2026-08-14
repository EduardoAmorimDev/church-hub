import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { FormProvider, useForm } from 'react-hook-form'
import { resolveIconName } from '@church/ui/atoms/Icon'
import { Dialog } from '@church/ui/organisms/Dialog'
import { APP_MEDIA_QUERY } from '@church/ui/utils'
import { Select, SelectOption, SelectProps } from '.'

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
const scrollIntoView = jest.fn()

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: matchMedia,
    writable: true
  })
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
    writable: true
  })
})

beforeEach(() => {
  narrow = false
  matchMedia.mockClear()
  scrollIntoView.mockClear()
})

afterEach(() => {
  document.body.style.overflow = ''
})

// invariant: synthetic data only (constitution, Principle V).
const GCS: SelectOption[] = [
  { value: 'gc-1', label: 'GC Exemplo Norte', iconName: 'groups' },
  { value: 'gc-2', label: 'GC Exemplo Sul', description: 'Rede Exemplo Sul' },
  { value: 'gc-3', label: 'GC Exemplo Leste', disabled: true },
  { value: 'gc-4', label: 'GC Exemplo Oeste' }
]

const BAIRROS: SelectOption[] = [
  { value: 'pinheiros', label: 'Pinheiros' },
  { value: 'sao-joao', label: 'São João', description: 'Zona Exemplo' },
  { value: 'se', label: 'Sé' },
  { value: 'santana', label: 'Santana' }
]

const MANY: SelectOption[] = Array.from({ length: 8 }, (_, index) => ({
  value: `opcao-${index + 1}`,
  label: `Opção Exemplo ${index + 1}`
}))

const renderSelect = (props: Partial<SelectProps> = {}) =>
  render(<Select label="GC" options={GCS} {...props} />)

const triggerOf = () => {
  const trigger = document.querySelector<HTMLElement>(
    '[aria-haspopup="listbox"]'
  )
  if (!trigger) throw new Error('no trigger')
  return trigger
}
const boxOf = () => {
  const box = triggerOf().parentElement
  if (!box) throw new Error('no box')
  return box
}
const valueOf = () => {
  const value = document.getElementById(
    triggerOf().getAttribute('aria-labelledby')?.split(' ').pop() ?? ''
  )
  if (!value) throw new Error('no value')
  return value
}
const chevronOf = () => {
  const chevron = boxOf().lastElementChild
  if (!(chevron instanceof HTMLElement)) throw new Error('no chevron')
  return chevron
}
const listOf = () => screen.getByRole('listbox')
const optionOf = (name: string | RegExp) => screen.getByRole('option', { name })
const searchOf = () => screen.getByRole('combobox', { name: /^Buscar em/ })
const isPopover = () =>
  screen.queryByRole('listbox') !== null &&
  screen.queryByRole('dialog') === null
const isSheet = () => screen.queryByRole('dialog') !== null
const scrimOf = () => {
  const scrim = document.querySelector<HTMLElement>('.bg-scrim')
  if (!scrim) throw new Error('no scrim')
  return scrim
}

describe('Select', () => {
  it('auto presentation (C1)', async () => {
    const user = userEvent.setup()

    const wide = render(<Select label="GC" options={GCS} />)
    await user.click(triggerOf())
    expect(isPopover()).toBe(true)
    wide.unmount()

    narrow = true
    const narrowWindow = render(<Select label="GC" options={GCS} />)
    await user.click(triggerOf())
    expect(screen.getByRole('dialog', { name: 'GC' })).toBeInTheDocument()
    narrowWindow.unmount()

    const desktop = render(
      <div data-viewport="desktop">
        <Select label="GC" options={GCS} />
      </div>
    )
    await user.click(triggerOf())
    expect(isPopover()).toBe(true)
    desktop.unmount()

    narrow = false
    render(
      <div data-viewport="mobile">
        <Select label="GC" options={GCS} />
      </div>
    )
    await user.click(triggerOf())
    expect(isSheet()).toBe(true)
  })

  it('closed markup ignores the viewport (C2)', () => {
    const tree = (
      <Select
        clearable
        defaultValue="gc-1"
        helperText="Só GCs da sua rede."
        label="GC"
        options={GCS}
        searchable
      />
    )

    narrow = true
    const narrowHtml = renderToString(tree)
    narrow = false
    const wideHtml = renderToString(tree)
    render(tree)

    expect(narrowHtml).toBe(wideHtml)
    expect(matchMedia).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('forced presentation (C3)', async () => {
    const user = userEvent.setup()
    narrow = true

    const popover = render(
      <div data-viewport="mobile">
        <Select label="GC" options={GCS} presentation="popover" />
      </div>
    )
    await user.click(triggerOf())
    expect(isPopover()).toBe(true)
    popover.unmount()

    narrow = false
    render(
      <div data-viewport="desktop">
        <Select label="GC" options={GCS} presentation="sheet" />
      </div>
    )
    await user.click(triggerOf())
    expect(isSheet()).toBe(true)
  })

  it('presentation is fixed while open (C4)', async () => {
    const user = userEvent.setup()
    const { rerender, unmount } = renderSelect()

    await user.click(triggerOf())
    expect(isPopover()).toBe(true)

    narrow = true
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    // why: a re-render while open fails any build that reads the width
    // during render instead of only when it opens.
    rerender(<Select helperText="Largura nova" label="GC" options={GCS} />)
    expect(screen.getByText('Largura nova')).toBeInTheDocument()
    expect(isPopover()).toBe(true)
    expect(listOf().closest('[role="dialog"]')).toBeNull()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(triggerOf())
    expect(isSheet()).toBe(true)
    unmount()

    narrow = true
    const sheet = renderSelect()
    await user.click(triggerOf())
    expect(screen.getByRole('dialog', { name: 'GC' })).toBeInTheDocument()

    narrow = false
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    sheet.rerender(
      <Select helperText="Largura nova" label="GC" options={GCS} />
    )
    expect(screen.getByText('Largura nova')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'GC' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(triggerOf())
    expect(isPopover()).toBe(true)
  })

  it('field markup (C5)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSelect({ helperText: 'Só GCs da sua rede.' })
    const trigger = triggerOf()
    const label = screen.getByText('GC')
    const asterisk = screen.getByText('*')
    const helper = screen.getByText('Só GCs da sua rede.').closest('p')

    expect(label.tagName).toBe('LABEL')
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
    expect(asterisk).toHaveClass('text-danger')
    expect(boxOf()).toHaveClass(
      'border',
      'border-control',
      'bg-surface',
      'focus-within:border-focus-ring',
      'focus-within:ring-1',
      'h-12',
      'rounded-xl'
    )
    expect(trigger).toHaveAttribute('role', 'combobox')
    expect(trigger).toHaveAttribute('tabindex', '0')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute(
      'aria-labelledby',
      `${label.id} ${valueOf().id}`
    )
    expect(trigger).toHaveAccessibleName('GC Selecione')
    expect(trigger).toHaveAttribute('aria-required', 'true')
    expect(trigger).toHaveAttribute('aria-describedby', helper?.id)
    expect(trigger).toHaveAccessibleDescription('Só GCs da sua rede.')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', listOf().id)
    unmount()

    const optional = renderSelect({ optional: true })
    expect(screen.getByText('(Opcional)')).toBeInTheDocument()
    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(triggerOf()).not.toHaveAttribute('aria-required')
    expect(triggerOf()).not.toHaveAttribute('aria-describedby')
    optional.unmount()

    const small = renderSelect({ size: 'small' })
    expect(boxOf()).toHaveClass('h-8', 'rounded-lg')
    small.unmount()

    renderSelect({ size: 'large' })
    expect(boxOf()).toHaveClass('h-14', 'rounded-2xl')
  })

  it('value display (C6)', () => {
    const empty = renderSelect()
    expect(valueOf()).toHaveTextContent('Selecione')
    expect(valueOf()).toHaveClass('text-secondary')
    empty.unmount()

    const custom = renderSelect({ placeholder: 'Escolha um GC' })
    expect(valueOf()).toHaveTextContent('Escolha um GC')
    custom.unmount()

    renderSelect({ defaultValue: 'gc-1' })
    const value = valueOf()
    const icon = value.previousElementSibling

    expect(value).toHaveTextContent('GC Exemplo Norte')
    expect(value).toHaveClass('text-primary', 'truncate', 'min-w-0', 'flex-1')
    expect(value).not.toHaveClass('text-secondary')
    expect(icon).toHaveTextContent('groups')
  })

  it('open chevron and ring (C7)', async () => {
    const user = userEvent.setup()
    renderSelect()
    const chevron = chevronOf()

    expect(chevron).toHaveTextContent(resolveIconName('expand_more'))
    expect(chevron).toHaveClass(
      'transition-transform',
      'duration-150',
      'ease-out'
    )
    expect(chevron).not.toHaveClass('rotate-180')
    expect(boxOf()).not.toHaveClass('ring-1')
    // invariant: the literals compiled by `Select focus ring (C7)` in
    // styles.spec.ts.
    expect(boxOf()).toHaveClass(
      'has-[[role=combobox]:focus-visible]:outline-2',
      'has-[[role=combobox]:focus-visible]:outline-offset-2',
      'has-[[role=combobox]:focus-visible]:outline-focus-ring'
    )

    await user.click(triggerOf())
    expect(chevron).toHaveClass('rotate-180')
    expect(boxOf()).toHaveClass(
      'border-focus-ring',
      'ring-1',
      'ring-focus-ring'
    )
    expect(boxOf()).not.toHaveClass('border-control')
  })

  it('clear button (C8)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { unmount } = renderSelect({
      clearable: true,
      defaultValue: 'gc-2',
      onChange
    })
    const clear = screen.getByRole('button', { name: 'Limpar GC' })

    expect(clear).toHaveClass('size-8', '-m-1')
    expect(clear).toHaveTextContent('close')
    expect(clear.nextElementSibling).toBe(chevronOf())

    await user.click(clear)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null, null)
    expect(valueOf()).toHaveTextContent('Selecione')
    expect(triggerOf()).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Limpar GC' })).toBeNull()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    unmount()

    const unlabelled = render(
      <Select clearable defaultValue="gc-2" options={GCS} />
    )
    expect(
      screen.getByRole('button', { name: 'Limpar seleção' })
    ).toBeInTheDocument()
    unlabelled.unmount()

    const disabled = renderSelect({
      clearable: true,
      defaultValue: 'gc-2',
      disabled: true
    })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    disabled.unmount()

    renderSelect({ clearable: true })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('disabled (C9)', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })
    const trigger = triggerOf()

    expect(trigger).toHaveAttribute('tabindex', '-1')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(boxOf()).toHaveClass(
      'bg-hover',
      'border-default',
      'cursor-not-allowed'
    )
    expect(valueOf()).toHaveClass('text-disabled')

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      fireEvent.keyDown(trigger, { key })
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    }
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('popover markup (C10)', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(triggerOf())
    const list = listOf()
    const popover = list.parentElement
    const anchor = popover?.parentElement

    expect(popover).toHaveClass(
      'absolute',
      'top-full',
      'mt-1',
      'inset-x-0',
      'z-30',
      'p-1',
      'rounded-2xl',
      'bg-surface',
      'border',
      'border-default',
      'shadow-elevation-low-bottom-12',
      'max-h-86'
    )
    expect(anchor).toHaveClass('relative')
    expect(anchor?.firstElementChild).toBe(boxOf())
    expect(list).toHaveAccessibleName('GC')
    expect(list).toHaveClass('max-h-72', 'overflow-y-auto', 'list-none')
  })

  it('option markup (C11)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderSelect({ defaultValue: 'gc-1', onChange })

    await user.click(triggerOf())
    const norte = optionOf(/Norte/)
    const sul = optionOf(/Sul/)
    const leste = optionOf(/Leste/)
    const description = within(sul).getByText('Rede Exemplo Sul')

    expect(within(listOf()).getAllByRole('option')).toHaveLength(4)
    expect(norte).toHaveAttribute('aria-selected', 'true')
    expect(sul).toHaveAttribute('aria-selected', 'false')
    expect(leste).toHaveAttribute('aria-disabled', 'true')
    expect(sul).not.toHaveAttribute('aria-disabled')
    expect(sul).toHaveClass(
      'min-h-11',
      'panel:not-in-data-[viewport=mobile]:min-h-10',
      'in-data-[viewport=desktop]:min-h-10',
      'px-3',
      'py-2',
      'rounded-lg',
      'gap-2',
      'text-size-50',
      'font-medium'
    )
    expect(within(norte).getByText('groups')).toHaveClass('text-icon-20!')
    expect(description).toHaveClass(
      'text-size-25',
      'font-normal',
      'text-secondary'
    )
    expect(norte).toHaveClass('bg-selected')
    expect(norte.lastElementChild).toHaveTextContent('check')
    expect(within(sul).queryByText('check')).not.toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(sul).toHaveAttribute('data-active', 'true')
    expect(sul).toHaveClass(
      'bg-hover',
      'outline-2',
      '-outline-offset-2',
      'outline-focus-ring'
    )
    expect(norte).not.toHaveClass('outline-2')
    expect(leste).toHaveClass('text-disabled', 'cursor-not-allowed')

    await user.click(leste)
    expect(onChange).not.toHaveBeenCalled()
    expect(listOf()).toBeInTheDocument()
  })

  it('opens (C12)', async () => {
    const user = userEvent.setup()
    const options: SelectOption[] = [
      { value: 'a', label: 'Opção A', disabled: true },
      ...GCS
    ]
    const { unmount } = render(
      <Select label="GC" options={options} defaultValue="gc-4" />
    )
    const trigger = triggerOf()

    await user.click(trigger)
    const oeste = optionOf(/Oeste/)
    expect(listOf()).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-activedescendant', oeste.id)
    expect(scrollIntoView.mock.contexts).toContain(oeste)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    for (const key of ['{ArrowDown}', '{ArrowUp}', '{Enter}', ' ']) {
      await user.keyboard(key)
      expect(listOf()).toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    }
    unmount()

    render(<Select label="GC" options={options} />)
    await user.click(triggerOf())
    expect(triggerOf()).toHaveAttribute(
      'aria-activedescendant',
      optionOf(/Norte/).id
    )
  })

  it('keyboard navigation (C13)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const options: SelectOption[] = [
      { value: 'a', label: 'Opção A', disabled: true },
      { value: 'b', label: 'Opção B' },
      { value: 'c', label: 'Opção C', disabled: true },
      { value: 'd', label: 'Opção D' },
      { value: 'e', label: 'Opção E', disabled: true }
    ]
    render(
      <>
        <Select label="Cargo" onChange={onChange} options={options} />
        <button type="button">Depois</button>
      </>
    )
    const trigger = triggerOf()
    const activeName = () =>
      document.getElementById(
        trigger.getAttribute('aria-activedescendant') ?? ''
      )?.textContent

    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Opção B')
    await user.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Opção D')
    await user.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Opção D')
    await user.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Opção B')
    await user.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Opção B')
    await user.keyboard('{End}')
    expect(activeName()).toBe('Opção D')
    await user.keyboard('{Home}')
    expect(activeName()).toBe('Opção B')

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('b', options[1])
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith('d', options[3])
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(listOf()).toBeInTheDocument()
    await user.tab()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus()
  })

  it('typeahead (C14)', async () => {
    jest.useFakeTimers()
    try {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime
      })
      render(<Select label="Bairro" options={BAIRROS} />)
      const trigger = triggerOf()
      const activeName = () =>
        document
          .getElementById(trigger.getAttribute('aria-activedescendant') ?? '')
          ?.querySelector('span > span')?.textContent

      trigger.focus()
      await user.keyboard('{ArrowDown}')
      expect(activeName()).toBe('Pinheiros')

      await user.keyboard('s')
      act(() => jest.advanceTimersByTime(100))
      await user.keyboard('a')
      expect(activeName()).toBe('São João')

      act(() => jest.advanceTimersByTime(600))
      await user.keyboard('s')
      act(() => jest.advanceTimersByTime(599))
      await user.keyboard('e')
      expect(activeName()).toBe('Sé')

      act(() => jest.advanceTimersByTime(600))
      await user.keyboard('p')
      expect(activeName()).toBe('Pinheiros')
      expect(listOf()).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  it('escape (C15)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSelect()

    await user.click(triggerOf())
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await waitFor(() => expect(triggerOf()).toHaveFocus())
    unmount()

    const onClose = jest.fn()
    render(
      <Dialog onClose={onClose} open title="Editar pessoa">
        <Select label="GC" options={GCS} />
      </Dialog>
    )
    await waitFor(() => expect(triggerOf()).toHaveFocus())

    await user.click(triggerOf())
    expect(listOf()).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('pointer (C16)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { unmount } = render(
      <>
        <Select label="GC" onChange={onChange} options={GCS} />
        <button type="button">Fora</button>
      </>
    )
    const trigger = triggerOf()

    await user.click(trigger)
    await user.hover(optionOf(/Oeste/))
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      optionOf(/Oeste/).id
    )
    await user.hover(optionOf(/Leste/))
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      optionOf(/Oeste/).id
    )

    expect(fireEvent.mouseDown(optionOf(/Sul/))).toBe(false)
    expect(trigger).toHaveFocus()

    await user.click(optionOf(/Sul/))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('gc-2', GCS[1])
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Fora' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Fora' })).toHaveFocus()
    unmount()

    render(<Select label="GC" options={GCS} searchable />)
    await user.click(triggerOf())
    await waitFor(() => expect(searchOf()).toHaveFocus())
    expect(fireEvent.mouseDown(optionOf(/Norte/))).toBe(false)
    expect(searchOf()).toHaveFocus()
  })

  it('search markup (C17)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderSelect({ searchable: true })

    await user.click(triggerOf())
    const input = searchOf()
    const row = input.parentElement

    await waitFor(() => expect(input).toHaveFocus())
    expect(row).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'px-3',
      'py-2',
      'mb-1',
      'border-b',
      'border-default',
      'after:h-0.5',
      'after:bg-focus-ring',
      'focus-within:after:opacity-100'
    )
    expect(row?.firstElementChild).toHaveTextContent('search')
    expect(row?.firstElementChild).toHaveClass('text-icon-20!')
    expect(input).toHaveClass('text-size-75', 'font-normal')
    expect(input).toHaveAccessibleName('Buscar em GC')
    expect(input).toHaveAttribute('placeholder', 'Buscar')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-controls', listOf().id)
    expect(input).toHaveAttribute('aria-activedescendant', optionOf(/Norte/).id)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', optionOf(/Sul/).id)
    unmount()

    render(<Select options={GCS} searchPlaceholder="Buscar GC" searchable />)
    await user.click(triggerOf())
    expect(searchOf()).toHaveAccessibleName('Buscar em opções')
    expect(searchOf()).toHaveAttribute('placeholder', 'Buscar GC')
  })

  it('search filters (C18)', async () => {
    const user = userEvent.setup()
    render(<Select label="Bairro" options={BAIRROS} searchable />)

    await user.click(triggerOf())
    await waitFor(() => expect(searchOf()).toHaveFocus())
    await user.keyboard('joao')
    expect(within(listOf()).getAllByRole('option')).toHaveLength(1)
    expect(optionOf(/São João/)).toBeInTheDocument()
    expect(searchOf()).toHaveAttribute(
      'aria-activedescendant',
      optionOf(/São João/).id
    )

    await user.clear(searchOf())
    await user.keyboard('EXEMPLO')
    expect(within(listOf()).getAllByRole('option')).toHaveLength(1)
    expect(optionOf(/São João/)).toBeInTheDocument()

    await user.clear(searchOf())
    await user.keyboard('sa')
    expect(
      within(listOf())
        .getAllByRole('option')
        .map(option => option.firstElementChild?.firstElementChild?.textContent)
    ).toEqual(['São João', 'Santana'])
    expect(searchOf()).toHaveAttribute(
      'aria-activedescendant',
      optionOf(/São João/).id
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(triggerOf()).toHaveFocus())
    await user.keyboard('p')
    await waitFor(() => expect(searchOf()).toHaveFocus())
    expect(searchOf()).toHaveValue('p')
    await user.keyboard('i')
    expect(searchOf()).toHaveValue('pi')
    expect(within(listOf()).getAllByRole('option')).toHaveLength(1)

    await user.keyboard('{Escape}')
    await user.click(triggerOf())
    expect(searchOf()).toHaveValue('')
    expect(within(listOf()).getAllByRole('option')).toHaveLength(4)
  })

  it('empty search (C19)', async () => {
    const user = userEvent.setup()
    render(<Select label="Bairro" options={BAIRROS} searchable />)

    await user.click(triggerOf())
    await waitFor(() => expect(searchOf()).toHaveFocus())
    await user.keyboard('zzz')
    const status = screen.getByRole('status')
    const clear = within(status).getByRole('button', { name: 'Limpar busca' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(status).toHaveTextContent('Nenhum resultado para “zzz”')
    expect(status).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-secondary'
    )
    expect(clear).toHaveClass('bg-transparent', 'text-primary', 'h-8')

    await user.click(clear)
    expect(searchOf()).toHaveValue('')
    expect(searchOf()).toHaveFocus()
    expect(within(listOf()).getAllByRole('option')).toHaveLength(4)
  })

  it('sheet presentation (C20)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const many = render(
      <Select
        label="Opção"
        onChange={onChange}
        options={MANY}
        presentation="sheet"
        searchable
      />
    )

    await user.click(triggerOf())
    const sheet = screen.getByRole('dialog', { name: 'Opção' })
    const row = searchOf().parentElement

    expect(sheet).toHaveClass('h-1/2')
    expect(listOf()).toHaveClass('max-h-none')
    expect(listOf()).not.toHaveClass('max-h-72')
    expect(optionOf('Opção Exemplo 2')).toHaveClass('min-h-12', 'text-size-75')
    expect(optionOf('Opção Exemplo 2')).not.toHaveClass('min-h-11')
    expect(row).toHaveClass(
      'sticky',
      'border',
      'border-control',
      'rounded-xl',
      'min-h-12'
    )
    await waitFor(() => expect(searchOf()).toHaveFocus())

    await user.click(optionOf('Opção Exemplo 3'))
    expect(onChange).toHaveBeenCalledWith('opcao-3', MANY[2])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(triggerOf()).toHaveFocus())

    await user.click(triggerOf())
    await waitFor(() => expect(searchOf()).toHaveFocus())
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(triggerOf()).toHaveFocus())

    await user.click(triggerOf())
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(triggerOf()).toHaveFocus())

    await user.click(triggerOf())
    expect(screen.getByRole('dialog', { name: 'Opção' })).toBeInTheDocument()
    await user.click(scrimOf())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(triggerOf()).toHaveFocus())
    expect(valueOf()).toHaveTextContent('Opção Exemplo 3')
    expect(onChange).toHaveBeenCalledTimes(1)
    many.unmount()

    render(<Select options={GCS} presentation="sheet" />)
    await user.click(triggerOf())
    const few = screen.getByRole('dialog', { name: 'Selecione' })
    expect(few).not.toHaveClass('h-1/2')
  })

  it('controlled and uncontrolled (C21)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { rerender, unmount } = render(
      <Select label="GC" onChange={onChange} options={GCS} value="gc-1" />
    )

    await user.click(triggerOf())
    await user.click(optionOf(/Sul/))
    expect(onChange).toHaveBeenCalledWith('gc-2', GCS[1])
    expect(valueOf()).toHaveTextContent('GC Exemplo Norte')

    rerender(
      <Select label="GC" onChange={onChange} options={GCS} value="gc-2" />
    )
    expect(valueOf()).toHaveTextContent('GC Exemplo Sul')

    rerender(
      <Select label="GC" onChange={onChange} options={GCS} value={null} />
    )
    expect(valueOf()).toHaveTextContent('Selecione')
    unmount()

    const uncontrolled = jest.fn()
    render(
      <Select
        defaultValue="gc-1"
        label="GC"
        onChange={uncontrolled}
        options={GCS}
      />
    )
    expect(valueOf()).toHaveTextContent('GC Exemplo Norte')
    await user.click(triggerOf())
    await user.click(optionOf(/Oeste/))
    expect(uncontrolled).toHaveBeenCalledWith('gc-4', GCS[3])
    expect(valueOf()).toHaveTextContent('GC Exemplo Oeste')
  })

  it('react-hook-form (C22)', async () => {
    const user = userEvent.setup()
    type Form = { gc: string | null }
    const Harness = ({ provider = false }: { provider?: boolean }) => {
      const form = useForm<Form>({ defaultValues: { gc: 'gc-2' } })
      const field = (
        <Select
          clearable
          control={provider ? undefined : form.control}
          label="GC"
          name="gc"
          options={GCS}
          rules={{ required: 'Escolha um GC.' }}
        />
      )
      return (
        <form onSubmit={form.handleSubmit(() => undefined)}>
          {provider ? <FormProvider {...form}>{field}</FormProvider> : field}
          <output data-testid="value">
            {JSON.stringify(form.watch('gc'))}
          </output>
          <output data-testid="touched">
            {form.formState.touchedFields.gc ? 'tocado' : 'intocado'}
          </output>
          <button type="submit">Salvar</button>
        </form>
      )
    }
    const valueInForm = () => screen.getByTestId('value').textContent

    for (const provider of [false, true]) {
      const { unmount } = render(<Harness provider={provider} />)
      expect(valueOf()).toHaveTextContent('GC Exemplo Sul')
      expect(screen.getByTestId('touched')).toHaveTextContent('intocado')

      await user.click(triggerOf())
      await user.click(optionOf(/Oeste/))
      expect(valueInForm()).toBe('"gc-4"')
      expect(valueOf()).toHaveTextContent('GC Exemplo Oeste')
      expect(screen.getByTestId('touched')).toHaveTextContent('tocado')

      await user.click(screen.getByRole('button', { name: 'Limpar GC' }))
      expect(valueInForm()).toBe('null')

      await user.click(screen.getByRole('button', { name: 'Salvar' }))
      const helper = await screen.findByText('Escolha um GC.')
      expect(helper.closest('p')).toHaveClass('text-danger')
      expect(triggerOf()).toHaveAttribute('aria-invalid', 'true')
      expect(triggerOf()).toHaveAccessibleDescription('Escolha um GC.')
      expect(boxOf()).toHaveClass('border-red-67', 'ring-red-67')
      unmount()
    }

    const Touched = () => {
      const form = useForm<Form>({ defaultValues: { gc: null } })
      return (
        <>
          <Select control={form.control} label="GC" name="gc" options={GCS} />
          <output data-testid="touched">
            {form.formState.touchedFields.gc ? 'tocado' : 'intocado'}
          </output>
        </>
      )
    }
    const touched = render(<Touched />)
    await user.click(triggerOf())
    expect(screen.getByTestId('touched')).toHaveTextContent('intocado')
    await user.keyboard('{Escape}')
    expect(screen.getByTestId('touched')).toHaveTextContent('tocado')
    touched.unmount()

    render(
      <Select
        helperText="Escolha um GC."
        label="GC"
        options={GCS}
        state="error"
      />
    )
    expect(triggerOf()).toHaveAttribute('aria-invalid', 'true')
    expect(boxOf()).toHaveClass('border-red-67', 'ring-red-67')
    expect(screen.getByText('Escolha um GC.').closest('p')).toHaveClass(
      'text-danger'
    )
  })

  it('defaultOpen (C23)', () => {
    const tree = (props: Partial<SelectProps>): ReactNode => (
      <Select defaultOpen label="GC" options={GCS} {...props} />
    )

    expect(renderToString(tree({}))).toContain('role="listbox"')
    expect(renderToString(tree({ disabled: true }))).not.toContain(
      'role="listbox"'
    )

    const open = render(tree({}))
    expect(listOf()).toBeInTheDocument()
    expect(triggerOf()).toHaveAttribute('aria-expanded', 'true')
    open.unmount()

    const disabled = render(tree({ disabled: true }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    disabled.unmount()

    render(<div data-viewport="mobile">{tree({})}</div>)
    expect(screen.getByRole('dialog', { name: 'GC' })).toBeInTheDocument()
  })
})
