import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it.each([
    'red',
    'orange',
    'yellow',
    'lime',
    'green',
    'cyan',
    'blue',
    'indigo',
    'purple',
    'pink'
  ] as const)('high colors: %s uses its 83 step with on-accent text', color => {
    render(
      <Badge color={color} variant="high">
        Ativo
      </Badge>
    )

    expect(screen.getByText('Ativo')).toHaveClass(
      `bg-${color}-83`,
      'text-on-accent'
    )
  })

  it('high colors: neutral uses action-primary with inverse text and no border', () => {
    render(
      <Badge color="neutral" variant="high">
        Ativo
      </Badge>
    )
    const badge = screen.getByText('Ativo')

    expect(badge).toHaveClass('bg-action-primary', 'text-inverse')
    expect(badge.className).not.toMatch(/(^|\s)border/)
  })

  it('defaults to a small, low, neutral inline span that does not wrap', () => {
    render(<Badge>Inativo</Badge>)
    const badge = screen.getByText('Inativo')

    expect(badge.tagName).toBe('SPAN')
    expect(badge).toHaveClass(
      'inline-flex',
      'whitespace-nowrap',
      'h-5',
      'text-size-25',
      'bg-neutral-alpha/10',
      'text-neutral-100'
    )
  })

  it('defaults to small when high', () => {
    render(<Badge variant="high">Novo</Badge>)
    const badge = screen.getByText('Novo')

    expect(badge.tagName).toBe('SPAN')
    expect(badge).toHaveClass('h-5', 'text-size-25', 'bg-action-primary')
  })
})
