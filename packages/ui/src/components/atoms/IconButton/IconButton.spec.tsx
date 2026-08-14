import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it.each([
    ['small', ['size-8', 'p-2', 'rounded-lg'], 'text-icon-16!'],
    ['medium', ['size-12', 'p-3', 'rounded-xl'], 'text-icon-20!'],
    ['large', ['size-14', 'p-3.5', 'rounded-2xl'], 'text-icon-24!']
  ] as const)(
    'square sizes: %s is a fixed square with its icon size',
    (size, boxClasses, iconClass) => {
      render(
        <IconButton aria-label="Editar" size={size}>
          <Icon name="edit" />
        </IconButton>
      )

      expect(screen.getByRole('button', { name: 'Editar' })).toHaveClass(
        ...boxClasses
      )
      expect(screen.getByText('edit')).toHaveClass(iconClass)
    }
  )

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
    'shares the button matrix: %s + %s',
    (variant, color, restClasses, hoverBackground) => {
      const { rerender } = render(
        <IconButton aria-label="Editar" color={color} variant={variant}>
          <Icon name="edit" />
        </IconButton>
      )
      const button = screen.getByRole('button', { name: 'Editar' })

      expect(button).toHaveClass(
        ...restClasses,
        `not-disabled:hover:bg-${hoverBackground}`,
        `not-disabled:active:bg-${hoverBackground}`
      )
      expect(screen.getByText('edit')).toHaveClass('text-current')

      rerender(
        <IconButton
          aria-label="Editar"
          color={color}
          disabled
          variant={variant}
        >
          <Icon name="edit" />
        </IconButton>
      )

      expect(button).toHaveClass('disabled:text-disabled')
      if (variant === 'transparent')
        expect(button).not.toHaveClass('disabled:bg-disabled')
      else expect(button).toHaveClass('disabled:bg-disabled')
    }
  )

  it('small hit area extends 6px above and below to reach 44px', () => {
    render(
      <IconButton aria-label="Editar" size="small">
        <Icon name="edit" />
      </IconButton>
    )

    expect(screen.getByRole('button', { name: 'Editar' })).toHaveClass(
      'relative',
      'after:absolute',
      'after:inset-x-0',
      'after:-inset-y-1.5'
    )
  })

  it('defaults to type="button"', () => {
    render(
      <IconButton aria-label="Editar">
        <Icon name="edit" />
      </IconButton>
    )

    expect(screen.getByRole('button', { name: 'Editar' })).toHaveAttribute(
      'type',
      'button'
    )
  })
})
