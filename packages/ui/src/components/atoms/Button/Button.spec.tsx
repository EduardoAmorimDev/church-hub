import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'
import { Button } from './Button'

describe('Button', () => {
  it('renders filled by default', () => {
    render(<Button>Salvar</Button>)

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
      'bg-neutral-999'
    )
  })

  it.each([
    ['ghost', 'bg-neutral-alpha/10'],
    ['transparent', 'bg-transparent']
  ] as const)('applies the %s variant', (variant, expected) => {
    render(<Button variant={variant}>Salvar</Button>)
    const button = screen.getByRole('button', { name: 'Salvar' })

    expect(button).toHaveClass(expected)
    expect(button).not.toHaveClass('bg-neutral-999')
  })

  it('keeps variant and size off the DOM', () => {
    render(
      <Button size="small" variant="ghost">
        Salvar
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Salvar' })

    expect(button).not.toHaveAttribute('variant')
    expect(button).not.toHaveAttribute('size')
    expect(button).toHaveClass('px-3', 'py-2', 'rounded-lg')
  })

  it('resizes its icons to the button size', () => {
    render(
      <Button size="small" startIcon={<Icon name="add" />}>
        Adicionar
      </Button>
    )

    expect(screen.getByText('add')).toHaveClass('text-icon-16!')
  })
})
