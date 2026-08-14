import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Icon } from '../Icon'
import { Chip } from './Chip'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
describe('Chip', () => {
  it('enabled chip (C17)', () => {
    render(
      <Chip
        endIcon={<Icon name="expand_more" />}
        startIcon={<Icon name="filter_list" />}
      >
        Todos
      </Chip>
    )
    const chip = screen.getByRole('button', { name: 'Todos' })

    expect(chip).toHaveAttribute('type', 'button')
    expect(chip).toHaveClass(
      'h-8',
      'px-3',
      'py-1',
      'gap-1.5',
      'rounded-lg',
      'border',
      'border-default',
      'bg-surface',
      'text-primary',
      'text-size-75',
      'font-medium'
    )
    const glyphs = chip.querySelectorAll('.material-symbols-outlined')
    expect(glyphs).toHaveLength(2)
    glyphs.forEach(glyph => expect(glyph).toHaveClass('text-icon-16!'))
  })

  it('44px hit area (C18)', () => {
    render(<Chip>Todos</Chip>)
    const chip = screen.getByRole('button')

    expect(chip).toHaveClass(
      'relative',
      'h-8',
      'after:absolute',
      'after:inset-x-0',
      'after:-inset-y-1.5'
    )
  })

  it('hover (C19)', () => {
    render(<Chip>Todos</Chip>)

    expect(screen.getByRole('button')).toHaveClass(
      'not-disabled:hover:bg-hover'
    )
  })

  it('toggle semantics (C20)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const { rerender } = render(<Chip onClick={onClick}>Todos</Chip>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed')

    rerender(
      <Chip onClick={onClick} selected={false}>
        Todos
      </Chip>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(
      <Chip onClick={onClick} selected>
        Todos
      </Chip>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('active look (C21)', () => {
    const { rerender } = render(<Chip>Todos</Chip>)
    expect(screen.getByRole('button')).not.toHaveClass('border-neutral-999')

    rerender(<Chip selected>Todos</Chip>)
    expect(screen.getByRole('button')).toHaveClass(
      'border-neutral-999',
      'bg-hover'
    )

    rerender(<Chip active>Todos</Chip>)
    expect(screen.getByRole('button')).toHaveClass(
      'border-neutral-999',
      'bg-hover'
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed')
  })

  it('disabled (C22)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(
      <Chip disabled onClick={onClick}>
        Todos
      </Chip>
    )
    const chip = screen.getByRole('button')

    expect(chip).toBeDisabled()
    expect(chip).toHaveClass('disabled:text-disabled')
    expect(chip.className).not.toMatch(/(^|\s)hover:/)

    await user.click(chip)
    expect(onClick).not.toHaveBeenCalled()
  })
})
