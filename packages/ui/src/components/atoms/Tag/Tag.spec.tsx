import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'
import { Tag } from './Tag'

describe('Tag', () => {
  it.each([
    ['large', ['text-size-75', 'rounded-10']],
    ['medium', ['text-size-50', 'rounded-lg']],
    ['small', ['text-size-25', 'rounded-md']]
  ] as const)('size %s uses its type and radius tokens', (size, expected) => {
    render(<Tag size={size}>Ativa</Tag>)

    expect(screen.getByText('Ativa')).toHaveClass(...expected)
  })

  it('applies the colour variant', () => {
    render(<Tag color="green">Ativa</Tag>)

    expect(screen.getByText('Ativa')).toHaveClass(
      'bg-green-alpha/10',
      'text-green-100'
    )
  })

  it('renders its icons around the label', () => {
    render(
      <Tag endIcon={<Icon name="close" />} startIcon={<Icon name="check" />}>
        Ativa
      </Tag>
    )

    expect(screen.getByText('Ativa')).toHaveTextContent('checkAtivaclose')
  })

  it.each([
    'neutral',
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
  ] as const)('low colors: %s uses its alpha/10 fill and 100 text', color => {
    render(<Tag color={color}>Ativa</Tag>)

    expect(screen.getByText('Ativa')).toHaveClass(
      `bg-${color}-alpha/10`,
      `text-${color}-100`
    )
  })

  it.each([
    ['small', ['h-5', 'py-0.5', 'px-1', 'rounded-md'], 'text-icon-14!'],
    ['medium', ['h-6', 'py-1', 'px-1.5', 'rounded-lg'], 'text-icon-16!'],
    ['large', ['h-8', 'py-1', 'px-1.5', 'rounded-10'], 'text-icon-20!']
  ] as const)(
    'sizes: %s has its height, padding, radius and icon size',
    (size, boxClasses, iconClass) => {
      render(
        <Tag size={size} startIcon={<Icon name="check" />}>
          Ativa
        </Tag>
      )

      expect(screen.getByText('Ativa')).toHaveClass('gap-1', ...boxClasses)
      expect(screen.getByText('check')).toHaveClass(iconClass, 'text-current')
    }
  )

  it('defaults to a small blue inline span that does not wrap', () => {
    render(<Tag>Louvor</Tag>)
    const tag = screen.getByText('Louvor')

    expect(tag.tagName).toBe('SPAN')
    expect(tag).toHaveClass(
      'inline-flex',
      'whitespace-nowrap',
      'h-5',
      'text-size-25',
      'bg-blue-alpha/10',
      'text-blue-100'
    )
  })
})
