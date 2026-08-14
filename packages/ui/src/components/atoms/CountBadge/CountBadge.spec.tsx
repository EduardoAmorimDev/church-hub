import { render, screen } from '@testing-library/react'
import { CountBadge } from './CountBadge'

const pillOf = (container: HTMLElement) => container.firstElementChild

describe('CountBadge', () => {
  it('pill values (C8)', () => {
    const { container } = render(<CountBadge count={12} />)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(pillOf(container)).toHaveClass(
      'min-w-6',
      'h-4.5',
      'py-px',
      'px-1',
      'rounded-sm',
      'bg-danger-solid',
      'text-on-danger',
      'text-size-25',
      'font-medium'
    )
  })

  it('reads the count once (C9)', () => {
    const { container } = render(<CountBadge count={12} />)

    expect(screen.getByText('12')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('12 novos')).toHaveClass('sr-only')
    expect(pillOf(container)).not.toHaveAttribute('aria-label')
  })

  it('caps at max (C10)', () => {
    const { rerender } = render(<CountBadge count={150} />)

    expect(screen.getByText('99+')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('150 novos')).toBeInTheDocument()

    rerender(<CountBadge count={10} max={9} />)

    expect(screen.getByText('9+')).toBeInTheDocument()
    expect(screen.getByText('10 novos')).toBeInTheDocument()
  })

  it('custom label (C11)', () => {
    render(<CountBadge count={3} label="3 mensagens não lidas" />)

    expect(screen.getByText('3 mensagens não lidas')).toHaveClass('sr-only')
    expect(screen.queryByText('3 novos')).not.toBeInTheDocument()
  })
})
