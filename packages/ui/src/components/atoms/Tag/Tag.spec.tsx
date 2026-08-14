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
      'bg-green-alpha/20',
      'text-green-67'
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
})
