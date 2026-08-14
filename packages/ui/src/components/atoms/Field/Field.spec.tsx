import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'
import { Field, FieldProps } from './Field'

const renderField = (props: FieldProps = {}) => {
  render(
    <Field
      aria-label="Campo fictício"
      placeholder="Digite aqui"
      startAdornment={<Icon name="person" />}
      {...props}
    />
  )
  const input = screen.getByRole('textbox', { name: 'Campo fictício' })
  const box = input.parentElement

  if (!box) throw new Error('Field renders its input inside a box')

  return { box, icon: screen.getByText('person'), input }
}

describe('Field', () => {
  it.each([
    ['small', ['h-8', 'px-3', 'py-1.5', 'rounded-lg'], 'text-icon-16!'],
    ['medium', ['h-12', 'px-3.5', 'py-3', 'rounded-xl'], 'text-icon-20!'],
    ['large', ['h-14', 'px-4.5', 'py-3.5', 'rounded-2xl'], 'text-icon-24!']
  ] as const)(
    'rest: %s has a 1px border-control box on bg-surface, its size and icon',
    (size, boxClasses, iconClass) => {
      const { box, icon, input } = renderField({ size })

      expect(box).toHaveClass('border', 'border-control', 'bg-surface')
      expect(box).toHaveClass(...boxClasses)
      expect(input).toHaveClass('text-primary', 'placeholder:text-secondary')
      expect(icon).toHaveClass('text-secondary', iconClass)
    }
  )

  it('hover and focus: hover turns the border neutral-83, focus draws the focus ring border and 1px shadow over 150ms', () => {
    const { box } = renderField()
    const tokens = box.className.split(' ')

    expect(
      tokens.some(
        token =>
          token.startsWith('hover:') && token.endsWith(':border-neutral-83')
      )
    ).toBe(true)
    expect(box).toHaveClass(
      'focus-within:border-focus-ring',
      'focus-within:ring-1',
      'focus-within:ring-focus-ring',
      'transition-[border-color,box-shadow]',
      'duration-150'
    )
  })

  it('disabled: bg-hover box with border-default, text-disabled value and placeholder, not-allowed cursor', () => {
    const { box, input } = renderField({ disabled: true })

    expect(box).toHaveClass('bg-hover', 'border-default', 'cursor-not-allowed')
    expect(box).not.toHaveClass('bg-surface', 'border-control')
    expect(
      box.className.split(' ').some(token => token.startsWith('hover:'))
    ).toBe(false)
    expect(input).toHaveClass(
      'text-disabled',
      'placeholder:text-disabled',
      'cursor-not-allowed'
    )
    expect(input).toBeDisabled()
  })
})
