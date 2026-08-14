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

describe('Button (Lamb)', () => {
  it.each([
    [
      'small',
      ['h-8', 'px-3', 'py-2', 'rounded-lg'],
      'text-size-50',
      'text-icon-16!'
    ],
    [
      'medium',
      ['h-12', 'px-4', 'py-3', 'rounded-xl'],
      'text-size-75',
      'text-icon-20!'
    ],
    [
      'large',
      ['h-14', 'px-5', 'py-3.5', 'rounded-2xl'],
      'text-size-100',
      'text-icon-24!'
    ]
  ] as const)(
    'sizes: %s has its fixed height, padding, radius, type and icon',
    (size, boxClasses, textClass, iconClass) => {
      render(
        <Button size={size} startIcon={<Icon name="add" />}>
          Salvar
        </Button>
      )
      const button = screen.getByRole('button', { name: /Salvar/ })

      expect(button).toHaveClass('gap-2', ...boxClasses)
      expect(screen.getByText('Salvar')).toHaveClass('font-medium', textClass)
      expect(screen.getByText('add')).toHaveClass(iconClass)
    }
  )

  it('type defaults to button and can be overridden', () => {
    const { rerender } = render(<Button>Salvar</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

    rerender(<Button type="submit">Salvar</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('small hit area extends 6px above and below to reach 44px', () => {
    render(<Button size="small">Salvar</Button>)

    expect(screen.getByRole('button')).toHaveClass(
      'relative',
      'after:absolute',
      'after:inset-x-0',
      'after:-inset-y-1.5'
    )
  })

  it.each([
    ['filled', 'neutral', ['bg-neutral-999', 'text-neutral-00'], 'neutral-100'],
    ['filled', 'accent', ['bg-accent-solid', 'text-on-accent'], 'blue-83'],
    [
      'filled',
      'positive',
      ['bg-positive-solid', 'text-on-positive'],
      'green-100'
    ],
    ['filled', 'destructive', ['bg-danger-solid', 'text-on-danger'], 'red-83'],
    [
      'ghost',
      'neutral',
      ['bg-neutral-alpha/10', 'text-primary'],
      'neutral-alpha/20'
    ],
    ['ghost', 'accent', ['bg-blue-alpha/10', 'text-blue-83'], 'blue-alpha/20'],
    [
      'ghost',
      'positive',
      ['bg-green-alpha/10', 'text-green-83'],
      'green-alpha/20'
    ],
    [
      'ghost',
      'destructive',
      ['bg-red-alpha/10', 'text-red-83'],
      'red-alpha/20'
    ],
    [
      'transparent',
      'neutral',
      ['bg-transparent', 'text-primary'],
      'neutral-alpha/10'
    ],
    [
      'transparent',
      'accent',
      ['bg-transparent', 'text-blue-83'],
      'blue-alpha/10'
    ],
    [
      'transparent',
      'positive',
      ['bg-transparent', 'text-green-83'],
      'green-alpha/10'
    ],
    [
      'transparent',
      'destructive',
      ['bg-transparent', 'text-red-83'],
      'red-alpha/10'
    ]
  ] as const)(
    'variant x color matrix: %s + %s',
    (variant, color, restClasses, hoverBackground) => {
      render(
        <Button color={color} variant={variant}>
          Salvar
        </Button>
      )
      const button = screen.getByRole('button')

      expect(button).toHaveClass(
        ...restClasses,
        `not-disabled:hover:bg-${hoverBackground}`,
        `not-disabled:active:bg-${hoverBackground}`,
        'transition-[background-color]',
        'duration-150',
        'ease-out'
      )
    }
  )

  it.each([
    ['filled', ['disabled:bg-disabled', 'disabled:text-disabled']],
    ['ghost', ['disabled:bg-disabled', 'disabled:text-disabled']],
    ['transparent', ['bg-transparent', 'disabled:text-disabled']]
  ] as const)('disabled per variant: %s', (variant, expected) => {
    render(
      <Button disabled variant={variant}>
        Salvar
      </Button>
    )
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    expect(button).toHaveClass(...expected)
    if (variant === 'transparent')
      expect(button).not.toHaveClass('disabled:bg-disabled')
  })
})
