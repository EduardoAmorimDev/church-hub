import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChip } from './FilterChip'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const removeButton = () =>
  screen.getByRole('button', { name: 'Remover filtro Rede: Jovens' })
const rootOf = () => removeButton().parentElement
const glyphOf = (element: HTMLElement) =>
  element.querySelector('.material-symbols-outlined')

describe('FilterChip', () => {
  it('removable chip (C13)', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    render(<FilterChip label="Rede" onRemove={onRemove} value="Jovens" />)

    expect(rootOf()).toHaveClass(
      'h-8',
      'border',
      'border-neutral-999',
      'rounded-lg',
      'bg-hover',
      'text-size-50',
      'font-medium'
    )
    expect(screen.getByText('Rede:')).toHaveClass(
      'font-normal',
      'text-secondary'
    )
    expect(screen.getByText('Jovens')).toHaveClass('font-semibold')
    expect(removeButton()).toHaveClass('w-8')
    expect(removeButton()).toHaveAttribute('type', 'button')
    expect(glyphOf(removeButton())).toHaveTextContent('close')

    await user.click(removeButton())
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('editable body (C14)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const { rerender } = render(
      <FilterChip
        label="Rede"
        onClick={onClick}
        onRemove={jest.fn()}
        value="Jovens"
      />
    )
    const body = screen.getByRole('button', {
      name: 'Editar filtro Rede: Jovens'
    })

    expect(body).toHaveAttribute('type', 'button')
    await user.click(body)
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(<FilterChip label="Rede" onRemove={jest.fn()} value="Jovens" />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByText('Jovens').closest('button')).toBeNull()
  })

  it('hover and pressed (C15)', () => {
    render(
      <FilterChip
        label="Rede"
        onClick={jest.fn()}
        onRemove={jest.fn()}
        value="Jovens"
      />
    )
    const body = screen.getByRole('button', {
      name: 'Editar filtro Rede: Jovens'
    })

    expect(body).toHaveClass('not-disabled:hover:bg-selected')
    expect(removeButton()).toHaveClass(
      'not-disabled:hover:bg-selected',
      'not-disabled:active:bg-neutral-alpha/40'
    )
  })

  it('44px hit area (C16)', () => {
    render(
      <FilterChip
        label="Rede"
        onClick={jest.fn()}
        onRemove={jest.fn()}
        value="Jovens"
      />
    )

    expect(rootOf()).toHaveClass('h-8')
    screen
      .getAllByRole('button')
      .forEach(button =>
        expect(button).toHaveClass(
          'relative',
          'after:absolute',
          'after:inset-x-0',
          'after:-inset-y-1.5'
        )
      )
  })

  it('disabled (C17)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const onRemove = jest.fn()
    render(
      <FilterChip
        disabled
        label="Rede"
        onClick={onClick}
        onRemove={onRemove}
        value="Jovens"
      />
    )
    const body = screen.getByRole('button', {
      name: 'Editar filtro Rede: Jovens'
    })

    expect(rootOf()).toHaveClass(
      'border-default',
      'bg-transparent',
      'text-disabled'
    )
    expect(rootOf()).not.toHaveClass('border-neutral-999', 'bg-hover')
    expect(screen.getByText('Rede:')).toHaveClass('text-disabled')
    expect(screen.getByText('Rede:')).not.toHaveClass('text-secondary')
    expect(body).toBeDisabled()
    expect(removeButton()).toBeDisabled()

    await user.click(body)
    await user.click(removeButton())
    expect(onClick).not.toHaveBeenCalled()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('toggle chip (C18)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const { rerender } = render(
      <FilterChip iconName="group" label="Membros" onClick={onClick} />
    )
    const chip = screen.getByRole('button', { name: /Membros/ })

    expect(chip).toHaveAttribute('aria-pressed', 'false')
    expect(chip).toHaveClass('h-8', 'border-default')
    expect(glyphOf(chip)).toHaveTextContent('group')

    await user.click(chip)
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <FilterChip iconName="group" label="Membros" onClick={onClick} selected />
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(glyphOf(screen.getByRole('button'))).toHaveTextContent('check')

    rerender(<FilterChip label="Membros" onClick={onClick} variant="toggle" />)
    expect(glyphOf(screen.getByRole('button'))).toBeNull()
  })

  it('explicit variant (C19)', () => {
    const { rerender } = render(
      <FilterChip label="Rede" value="Jovens" variant="removable" />
    )

    expect(removeButton()).toBeInTheDocument()
    expect(removeButton()).not.toHaveAttribute('aria-pressed')

    rerender(
      <FilterChip
        label="Rede"
        onRemove={jest.fn()}
        value="Jovens"
        variant="toggle"
      />
    )
    expect(
      screen.queryByRole('button', { name: /Remover filtro/ })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})
