import { render, screen } from '@testing-library/react'
import { Typography } from './Typography'

describe('Typography', () => {
  it('d3 is display-small: Oswald 700 uppercase at 24/30 in a span', () => {
    render(<Typography variant="d3">R$ 2.115,00</Typography>)
    const text = screen.getByText('R$ 2.115,00')

    expect(text.tagName).toBe('SPAN')
    expect(text).toHaveClass(
      'font-oswald',
      'font-bold',
      'uppercase',
      'text-size-300',
      'leading-7.5'
    )
  })

  it('p0 is body-large: Inter 400 at 18/28 in a paragraph', () => {
    render(<Typography variant="p0">Informação clara</Typography>)
    const text = screen.getByText('Informação clara')

    expect(text.tagName).toBe('P')
    expect(text).toHaveClass('font-sans', 'font-normal', 'text-size-100')
    expect(text.className).not.toMatch(/leading-/)
  })

  it.each([
    ['d1', ['font-oswald', 'font-bold', 'text-size-500']],
    ['d2', ['font-oswald', 'font-bold', 'text-size-400']],
    ['h2', ['font-sans', 'font-semibold', 'text-size-300']],
    ['f3', ['font-sans', 'font-medium', 'text-size-50']],
    ['p1', ['font-sans', 'font-normal', 'text-size-75']]
  ] as const)('keeps the current %s values', (variant, expected) => {
    render(<Typography variant={variant}>Texto</Typography>)

    expect(screen.getByText('Texto')).toHaveClass(...expected)
  })
})
