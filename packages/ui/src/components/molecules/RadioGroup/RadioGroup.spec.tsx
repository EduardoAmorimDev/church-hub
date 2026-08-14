import fs from 'node:fs'
import path from 'node:path'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { RadioGroup, RadioGroupProps } from './RadioGroup'
import { Radio } from '@church/ui/atoms/Radio'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM/accessibility tree; the density cascade is
// compiled in styles.spec (C42).
type GroupProps = Omit<RadioGroupProps, 'children'>

const Visitors = (props: GroupProps) => (
  <RadioGroup legend="Tipo de visitante" {...props}>
    <Radio
      description="Nunca participou de um GC ou culto"
      label="Primeira vez"
      value="primeira"
    />
    <Radio label="Voltou" value="retorno" />
    <Radio label="Convidado de membro" value="convidado" />
  </RadioGroup>
)

const groupOf = () => screen.getByRole('radiogroup')
const optionsOf = () => screen.getAllByRole('radio')
const rowOf = (radio: HTMLElement) => radio.closest('label')
const optionsBoxOf = () => rowOf(optionsOf()[0])?.parentElement

describe('RadioGroup', () => {
  it('fieldset and legend (C28)', () => {
    const { rerender } = render(<Visitors />)
    const group = screen.getByRole('radiogroup', { name: 'Tipo de visitante' })
    const legend = group.querySelector('legend')

    expect(group.tagName).toBe('FIELDSET')
    expect(legend).not.toBeNull()
    expect(group).toHaveAttribute('aria-labelledby', legend?.id)
    expect(legend).toHaveClass(
      'text-size-75',
      'font-medium',
      'text-primary',
      'mb-1'
    )
    expect(legend).not.toHaveClass('sr-only')

    rerender(<Visitors legendHidden />)
    expect(
      screen.getByRole('radiogroup', { name: 'Tipo de visitante' })
    ).toBeInTheDocument()
    expect(groupOf().querySelector('legend')).toHaveClass('sr-only')
  })

  it('options inherit from the group (C29)', () => {
    const { rerender } = render(
      <Visitors disabled name="tipo" size="large" value="retorno" />
    )

    optionsOf().forEach(radio => {
      expect(radio).toHaveAttribute('name', 'tipo')
      expect(radio).toBeDisabled()
      expect(radio).toHaveClass('size-7')
    })
    expect(screen.getByRole('radio', { name: 'Voltou' })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /^Primeira vez/ })
    ).not.toBeChecked()

    rerender(<Visitors size="small" value="primeira" />)
    const names = optionsOf().map(radio => radio.getAttribute('name'))

    expect(names[0]).toBeTruthy()
    expect(new Set(names).size).toBe(1)
    optionsOf().forEach(radio => {
      expect(radio).toBeEnabled()
      expect(radio).toHaveClass('size-4')
    })
    expect(screen.getByRole('radio', { name: /^Primeira vez/ })).toBeChecked()
  })

  it('uncontrolled and controlled (C30)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { unmount } = render(
      <Visitors defaultValue="retorno" onChange={onChange} />
    )

    expect(screen.getByRole('radio', { name: 'Voltou' })).toBeChecked()
    await user.click(screen.getByText('Primeira vez'))
    expect(screen.getByRole('radio', { name: /^Primeira vez/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Voltou' })).not.toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      'primeira',
      expect.objectContaining({ target: expect.anything() })
    )
    unmount()

    const onControlledChange = jest.fn()
    const Controlled = () => {
      const [value, setValue] = useState('retorno')
      return (
        <>
          <Visitors onChange={onControlledChange} value={value} />
          <button onClick={() => setValue('convidado')} type="button">
            Pai muda
          </button>
        </>
      )
    }
    render(<Controlled />)

    await user.click(screen.getByText('Primeira vez'))
    expect(onControlledChange).toHaveBeenCalledWith(
      'primeira',
      expect.anything()
    )
    expect(screen.getByRole('radio', { name: 'Voltou' })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /^Primeira vez/ })
    ).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Pai muda' }))
    expect(
      screen.getByRole('radio', { name: 'Convidado de membro' })
    ).toBeChecked()
  })

  it('arrow keys select (C31)', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup defaultValue="primeira" legend="Tipo de visitante">
        <Radio label="Primeira vez" value="primeira" />
        <Radio disabled label="Voltou" value="retorno" />
        <Radio label="Convidado de membro" value="convidado" />
      </RadioGroup>
    )
    const first = screen.getByRole('radio', { name: /^Primeira vez/ })
    const third = screen.getByRole('radio', { name: 'Convidado de membro' })

    await user.tab()
    expect(first).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(third).toHaveFocus()
    expect(third).toBeChecked()
    expect(first).not.toBeChecked()
  })

  it('helper text (C32)', () => {
    render(<Visitors helperText="Escolha a opção que melhor descreve." />)
    const helper = screen.getByText('Escolha a opção que melhor descreve.')
    const paragraph = helper.closest('p')

    expect(paragraph).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-secondary'
    )
    expect(groupOf()).toHaveAttribute('aria-describedby', paragraph?.id)
    expect(groupOf()).toHaveAccessibleDescription(
      'Escolha a opção que melhor descreve.'
    )
    expect(groupOf().querySelector('legend')?.nextElementSibling).toBe(
      paragraph
    )
  })

  it('error state (C33)', () => {
    render(
      <Visitors
        error="Responda para enviar o relatório."
        helperText="Escolha uma opção."
      />
    )
    const message = screen
      .getByText('Responda para enviar o relatório.')
      .closest('p')
    const options = optionsBoxOf()

    expect(message).toHaveClass('text-danger')
    expect(
      message?.querySelector('.material-symbols-outlined')
    ).toHaveTextContent('error')
    expect(options?.nextElementSibling).toBe(message)
    expect(groupOf()).toHaveAttribute('aria-invalid', 'true')
    expect(groupOf().getAttribute('aria-describedby')?.split(' ')).toContain(
      message?.id
    )
    expect(groupOf()).toHaveAccessibleDescription(
      'Escolha uma opção. Responda para enviar o relatório.'
    )
    optionsOf().forEach(radio => expect(radio).toHaveClass('border-red-67'))
  })

  it('required by default (C34)', () => {
    const { rerender } = render(<Visitors />)
    const legend = groupOf().querySelector('legend')
    const asterisk = legend?.lastElementChild

    expect(groupOf()).toHaveAttribute('aria-required', 'true')
    expect(asterisk?.textContent).toBe(' *')
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
    expect(legend).toHaveTextContent(/\*$/)
    expect(screen.queryByText('(Opcional)')).not.toBeInTheDocument()

    rerender(<Visitors optional />)
    expect(groupOf()).not.toHaveAttribute('aria-required')
    expect(groupOf().querySelector('legend')).not.toHaveTextContent('*')
    expect(screen.getByText('(Opcional)')).toBeInTheDocument()
  })

  it('horizontal (C35)', () => {
    render(<Visitors orientation="horizontal" />)

    expect(optionsBoxOf()).toHaveClass(
      'flex',
      'flex-row',
      'flex-wrap',
      'gap-x-6'
    )
    expect(optionsBoxOf()).not.toHaveClass('flex-col')
  })

  it('card options (C36)', () => {
    render(<Visitors variant="card" />)

    optionsOf().forEach(radio =>
      expect(rowOf(radio)).toHaveClass(
        'p-4',
        'border',
        'border-default',
        'rounded-xl',
        'bg-surface'
      )
    )
    expect(optionsBoxOf()).toHaveClass('gap-2')
    expect(screen.getByText('Nunca participou de um GC ou culto')).toHaveClass(
      'leading-5'
    )
  })

  it('card states (C37)', () => {
    render(<Visitors value="primeira" variant="card" />)
    const checkedRow = rowOf(
      screen.getByRole('radio', { name: /^Primeira vez/ })
    )
    const idleRow = rowOf(screen.getByRole('radio', { name: 'Voltou' }))

    expect(checkedRow).toHaveClass(
      'border-neutral-999',
      'inset-ring',
      'inset-ring-neutral-999'
    )
    expect(checkedRow).not.toHaveClass('border-default')
    expect(idleRow).not.toHaveClass('inset-ring', 'border-neutral-999')
    ;[checkedRow, idleRow].forEach(row =>
      expect(row).toHaveClass('hover:bg-hover', 'active:bg-selected')
    )
    expect(idleRow).toHaveClass('hover:border-neutral-33')
    expect(checkedRow).not.toHaveClass('hover:border-neutral-33')
  })

  it('card focus ring (C38)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Visitors variant="card" />)
    const first = optionsOf()[0]

    await user.tab()
    expect(first).toHaveFocus()
    expect(rowOf(first)).toHaveClass(
      'has-focus-visible:outline-2',
      'has-focus-visible:outline-offset-2',
      'has-focus-visible:outline-focus-ring'
    )
    expect(first).toHaveClass('focus-visible:outline-none')
    unmount()

    render(<Visitors />)
    expect(optionsOf()[0].className).not.toMatch(/outline-(none|0|hidden)/)
    expect(rowOf(optionsOf()[0])?.className).not.toMatch(/has-focus-visible/)
  })

  it('card error and disabled (C39)', () => {
    const { unmount } = render(
      <Visitors error="Responda." value="primeira" variant="card" />
    )

    optionsOf().forEach(radio =>
      expect(rowOf(radio)).toHaveClass('border-red-67')
    )
    unmount()

    render(
      <RadioGroup legend="Tipo de visitante" value="retorno" variant="card">
        <Radio label="Primeira vez" value="primeira" />
        <Radio disabled label="Voltou" value="retorno" />
      </RadioGroup>
    )
    const disabledRow = rowOf(screen.getByRole('radio', { name: 'Voltou' }))

    expect(disabledRow).toHaveClass('bg-hover', 'border-default')
    expect(disabledRow).not.toHaveClass(
      'bg-surface',
      'inset-ring',
      'border-neutral-999',
      'hover:bg-hover'
    )
  })

  it('card grid (C40)', () => {
    render(<Visitors orientation="horizontal" variant="card" />)
    const theme = fs.readFileSync(
      path.resolve(__dirname, '../../../styles.css'),
      'utf8'
    )

    expect(optionsBoxOf()).toHaveClass('grid', 'grid-cols-fill-50', 'gap-2')
    // invariant: 50 spacing units of 4px = the 200px minimum column.
    expect(theme.replace(/\s+/g, ' ')).toContain(
      '--grid-template-columns-fill-50: repeat( auto-fit, minmax(calc(var(--spacing) * 50), 1fr) );'
    )
  })

  it('disabled group (C41)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Visitors disabled onChange={onChange} />)

    optionsOf().forEach(radio => expect(radio).toBeDisabled())
    await user.click(screen.getByText('Voltou'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('density classes (C42)', () => {
    const { unmount } = render(
      <RadioGroup legend="Tipo de visitante">
        <Radio label="Primeira vez" value="primeira" />
        <Radio label="Voltou" size="large" value="retorno" />
      </RadioGroup>
    )
    const [medium, large] = optionsOf()

    expect(optionsBoxOf()).toHaveClass(
      'gap-y-0',
      'panel:not-in-data-[viewport=mobile]:gap-y-3',
      'in-data-[viewport=desktop]:gap-y-3'
    )
    expect(rowOf(medium)).toHaveClass(
      'min-h-11',
      'py-2.5',
      'panel:not-in-data-[viewport=mobile]:min-h-0',
      'panel:not-in-data-[viewport=mobile]:py-0',
      'in-data-[viewport=desktop]:min-h-0',
      'in-data-[viewport=desktop]:py-0'
    )
    expect(rowOf(large)).toHaveClass(
      'min-h-11',
      'py-1.5',
      'panel:not-in-data-[viewport=mobile]:py-0'
    )
    expect(rowOf(large)).not.toHaveClass('py-2.5')
    unmount()

    render(<Visitors variant="card" />)
    expect(optionsBoxOf()).toHaveClass('gap-2')
    expect(optionsBoxOf()?.className).not.toMatch(/panel:|data-\[viewport/)
    optionsOf().forEach(radio => {
      expect(rowOf(radio)).not.toHaveClass('min-h-11', 'py-2.5')
      expect(rowOf(radio)?.className).not.toMatch(/panel:|data-\[viewport/)
    })
    expect(within(groupOf()).getAllByRole('radio')).toHaveLength(3)
  })
})
