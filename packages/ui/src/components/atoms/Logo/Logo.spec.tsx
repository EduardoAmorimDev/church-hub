import fs from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

const svgOf = (img: HTMLElement) => img.querySelector('svg')

describe('Logo', () => {
  it('full logo (C12)', () => {
    render(<Logo />)
    const img = screen.getByRole('img', { name: 'Igreja Batista Filadélfia' })
    const svg = svgOf(img)

    expect(img).toHaveClass('h-10')
    expect(svg).toHaveAttribute('viewBox', '0 0 119 40')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).toHaveClass('h-full', 'w-auto')
  })

  it('symbol logo (C13)', () => {
    render(<Logo variant="symbol" />)
    const img = screen.getByRole('img', { name: 'Igreja Batista Filadélfia' })

    expect(img).toHaveClass('h-10')
    expect(svgOf(img)).toHaveAttribute('viewBox', '0 0 41 40')
  })

  it('custom label (C14)', () => {
    render(<Logo label="Ir para o início" />)

    expect(
      screen.getByRole('img', { name: 'Ir para o início' })
    ).toBeInTheDocument()
  })

  it('height through className (C15)', () => {
    render(<Logo className="h-6" />)
    const img = screen.getByRole('img')

    expect(img).toHaveClass('h-6')
    expect(img).not.toHaveClass('h-10')
    expect(svgOf(img)).toHaveClass('h-full', 'w-auto')
  })

  it('brand colours come from tokens (C16)', () => {
    const { rerender } = render(<Logo />)

    for (const variant of ['full', 'symbol'] as const) {
      rerender(<Logo variant={variant} />)
      const img = screen.getByRole('img')
      const fills = Array.from(img.querySelectorAll('path')).map(
        p => p.getAttribute('class') ?? ''
      )

      expect(img).toHaveClass('text-neutral-999')
      expect(fills).toContain('fill-current')
      expect(fills).toContain('fill-brand-red')
      expect(fills).toContain('fill-brand-blue')
      expect(fills).toContain('fill-brand-teal')
      expect(fills.every(fill => fill.startsWith('fill-'))).toBe(true)
      expect(
        Array.from(img.querySelectorAll('path')).some(p =>
          p.hasAttribute('fill')
        )
      ).toBe(false)
    }

    for (const file of ['Logo.tsx', 'data/index.ts']) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    }
  })
})
