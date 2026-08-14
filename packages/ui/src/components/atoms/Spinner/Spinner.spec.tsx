import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('decorative ring (C4)', () => {
    const { container } = render(<Spinner />)
    const ring = container.firstElementChild

    expect(ring).toHaveAttribute('aria-hidden', 'true')
    expect(ring).not.toHaveAttribute('role')
    expect(ring).toHaveClass(
      'size-em',
      'rounded-full',
      'border-2',
      'border-current',
      'border-r-transparent',
      'animate-spinner'
    )
  })

  it('named status (C6)', () => {
    render(<Spinner label="Salvando…" />)

    const status = screen.getByRole('status', { name: 'Salvando…' })
    expect(status).not.toHaveAttribute('aria-hidden')
  })
})
