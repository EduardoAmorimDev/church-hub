import { render, screen } from '@testing-library/react'
import { Icon, resolveIconName } from './Icon'

describe('Icon', () => {
  it.each([
    ['xSmall', 'text-icon-12!'],
    ['small', 'text-icon-16!'],
    ['medium', 'text-icon-20!'],
    ['large', 'text-icon-24!'],
    ['xLarge', 'text-icon-28!']
  ] as const)('size %s uses the %s token', (size, expected) => {
    render(<Icon name="add" size={size} />)

    expect(screen.getByText('add')).toHaveClass(expected)
  })

  it('is hidden from assistive technology', () => {
    render(<Icon name="add" />)

    expect(screen.getByText('add')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a Figma alias as its Material Symbols glyph', () => {
    render(<Icon name="expand_more" />)

    expect(screen.getByText('keyboard_arrow_down')).toBeInTheDocument()
    expect(screen.queryByText('expand_more')).not.toBeInTheDocument()
  })

  it('leaves non-alias names untouched', () => {
    expect(resolveIconName('chevron_left')).toBe('chevron_left')
    expect(resolveIconName('expand_less')).toBe('keyboard_arrow_up')
  })

  it('marks the disabled state', () => {
    render(<Icon disabled name="add" />)

    expect(screen.getByText('add')).toHaveAttribute('data-disabled', 'true')
  })
})
