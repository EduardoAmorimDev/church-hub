import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio } from './Radio'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM state, not computed styles.
const circleOf = () => screen.getByRole('radio')
const dotOf = (radio: HTMLElement) => radio.nextElementSibling
const boxOf = (radio: HTMLElement) => radio.parentElement
const rowOf = (radio: HTMLElement) => radio.closest('label')

describe('Radio', () => {
  it('native radio in a label (C23)', async () => {
    const user = userEvent.setup()
    render(<Radio label="Primeira vez" name="tipo" value="primeira" />)
    const radio = screen.getByRole('radio', { name: 'Primeira vez' })

    expect(radio).toHaveAttribute('type', 'radio')
    expect(radio).toHaveAttribute('value', 'primeira')
    // invariant: the 44px row is App density only (lote 2, criterion 43);
    // the compiled cascade is proven in styles.spec (C42).
    expect(rowOf(radio)).toHaveClass(
      'min-h-11',
      'py-2.5',
      'panel:not-in-data-[viewport=mobile]:min-h-0',
      'panel:not-in-data-[viewport=mobile]:py-0',
      'in-data-[viewport=desktop]:min-h-0',
      'in-data-[viewport=desktop]:py-0'
    )

    await user.click(screen.getByText('Primeira vez'))
    expect(radio).toBeChecked()
  })

  it('medium size (C24)', () => {
    render(<Radio label="Primeira vez" value="primeira" />)
    const radio = circleOf()

    expect(boxOf(radio)).toHaveClass('size-6')
    expect(radio).toHaveClass(
      'size-5',
      'rounded-full',
      'border-2',
      'border-control',
      'bg-surface'
    )
    expect(screen.getByText('Primeira vez')).toHaveClass(
      'text-size-75',
      'font-medium'
    )
    expect(rowOf(radio)).toHaveClass('gap-2')
  })

  it.each([
    ['small', 'size-4', 'size-4', ['text-size-50']],
    ['large', 'size-8', 'size-7', ['text-size-100', 'leading-8']]
  ] as const)(
    'small and large sizes (C25): %s',
    (size, box, circle, labelClasses) => {
      render(<Radio label="Voltou" size={size} value="retorno" />)
      const radio = circleOf()

      expect(boxOf(radio)).toHaveClass(box)
      expect(radio).toHaveClass(circle)
      expect(screen.getByText('Voltou')).toHaveClass(...labelClasses)
    }
  )

  it.each([
    ['small', 'size-2'],
    ['medium', 'size-2.5'],
    ['large', 'size-3.5']
  ] as const)('checked dot (C26): %s', (size, dot) => {
    const { rerender } = render(
      <Radio
        checked={false}
        label="Voltou"
        onChange={jest.fn()}
        size={size}
        value="retorno"
      />
    )
    const radio = circleOf()

    expect(radio).not.toBeChecked()
    expect(dotOf(radio)).toHaveClass(dot, 'scale-0', 'peer-checked:scale-100')
    expect(dotOf(radio)).toHaveClass(
      'rounded-full',
      'bg-current',
      'text-neutral-999'
    )
    expect(radio).toHaveClass('checked:border-neutral-999')

    rerender(
      <Radio
        checked
        label="Voltou"
        onChange={jest.fn()}
        size={size}
        value="retorno"
      />
    )
    expect(circleOf()).toBeChecked()
  })

  it('description (C27)', () => {
    render(
      <Radio
        description="Nunca participou de um GC ou culto"
        label="Primeira vez"
        value="primeira"
      />
    )
    const description = screen.getByText('Nunca participou de um GC ou culto')

    expect(description).toHaveClass(
      'text-size-50',
      'font-normal',
      'text-secondary'
    )
    expect(description.parentElement).toHaveClass('gap-0.5')
    expect(circleOf()).toHaveAccessibleDescription(
      'Nunca participou de um GC ou culto'
    )
  })

  it('hover and pressed (C28)', () => {
    render(<Radio label="Voltou" value="retorno" />)
    const radio = circleOf()

    expect(radio).toHaveClass(
      'not-disabled:not-checked:group-hover:border-neutral-83',
      'not-disabled:group-hover:bg-hover',
      'not-disabled:group-active:bg-selected',
      'duration-150',
      'ease-out'
    )
    expect(dotOf(radio)).toHaveClass('duration-150', 'ease-out')
  })

  it('focus ring on the circle (C29)', async () => {
    const user = userEvent.setup()
    render(<Radio label="Voltou" value="retorno" />)
    const radio = circleOf()

    await user.tab()

    // why: the ring is the global `:focus-visible` outline (styles.spec);
    // the focused element must be the circle and must not suppress it.
    expect(radio).toHaveFocus()
    expect(radio).toHaveClass('appearance-none', 'rounded-full')
    expect(radio.className).not.toMatch(/outline-(none|0|hidden)/)
  })

  it('single choice by name (C30)', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Radio label="Primeira vez" name="tipo" value="primeira" />
        <Radio label="Voltou" name="tipo" value="retorno" />
      </>
    )
    const [first, second] = screen.getAllByRole('radio')

    await user.tab()
    expect(first).toHaveFocus()
    await user.keyboard(' ')
    expect(first).toBeChecked()

    await user.click(second)
    expect(second).toBeChecked()
    expect(first).not.toBeChecked()
  })

  it('disabled (C31)', async () => {
    const user = userEvent.setup()
    render(
      <Radio
        description="Nunca participou"
        disabled
        label="Primeira vez"
        value="primeira"
      />
    )
    const radio = circleOf()

    expect(radio).toBeDisabled()
    expect(radio).toHaveClass(
      'disabled:border-neutral-33',
      'disabled:bg-disabled',
      'disabled:cursor-not-allowed'
    )
    expect(dotOf(radio)).toHaveClass('peer-disabled:text-disabled')
    expect(rowOf(radio)).toHaveClass('text-disabled', 'cursor-not-allowed')
    expect(screen.getByText('Nunca participou')).toHaveClass('text-disabled')

    await user.tab()
    expect(radio).not.toHaveFocus()
    await user.click(screen.getByText('Primeira vez'))
    expect(radio).not.toBeChecked()
  })
})
