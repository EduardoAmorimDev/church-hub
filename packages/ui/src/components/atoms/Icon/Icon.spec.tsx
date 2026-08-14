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

  it.each([
    ['people_alt', 'group'],
    ['remove_red_eye', 'visibility'],
    ['warning_amber', 'warning'],
    ['insert_chart_outlined', 'bar_chart'],
    ['error_outline', 'error'],
    ['expand_more', 'keyboard_arrow_down'],
    ['expand_less', 'keyboard_arrow_up']
  ] as const)('aliases: %s renders the %s glyph', (alias, glyph) => {
    render(<Icon name={alias} />)

    expect(screen.getByText(glyph)).toBeInTheDocument()
    expect(screen.queryByText(alias)).not.toBeInTheDocument()
  })

  it('label gives the icon role="img" and an accessible name', () => {
    render(<Icon label="Atenção" name="warning" />)
    const icon = screen.getByRole('img', { name: 'Atenção' })

    expect(icon).toHaveTextContent('warning')
    expect(icon).not.toHaveAttribute('aria-hidden')
  })

  it('stays aria-hidden without a label, whatever props are forwarded', () => {
    render(<Icon aria-hidden={false} name="add" role="img" />)
    const icon = screen.getByText('add')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
