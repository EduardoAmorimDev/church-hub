import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
describe('Divider', () => {
  it('horizontal decorative rule (C1)', () => {
    const { container } = render(<Divider />)
    const rule = container.querySelector('hr')

    expect(rule).toBeInTheDocument()
    expect(rule).toHaveAttribute('aria-hidden', 'true')
    expect(rule).not.toHaveAttribute('role')
    expect(rule).toHaveClass(
      'm-0',
      'border-0',
      'border-t',
      'border-default',
      'h-0',
      'w-full'
    )
  })

  it('vertical rule is visible (C2)', () => {
    const { container } = render(<Divider orientation="vertical" />)
    const rule = container.querySelector('hr')

    expect(rule).toHaveClass(
      'w-0',
      'border-l',
      'border-default',
      'self-stretch',
      'min-h-4'
    )
    expect(rule).not.toHaveClass('border-t')
    expect(rule?.className).not.toMatch(/opacity/)
  })

  it('semantic separator (C3)', () => {
    const { rerender } = render(<Divider decorative={false} />)
    let separator = screen.getByRole('separator')

    expect(separator).not.toHaveAttribute('aria-hidden')
    expect(separator).not.toHaveAttribute('aria-orientation')

    rerender(<Divider decorative={false} orientation="vertical" />)
    separator = screen.getByRole('separator')

    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })
})
