import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { TextArea } from './TextArea'

const counterOf = (textarea: HTMLElement) => {
  const id = textarea
    .getAttribute('aria-describedby')
    ?.split(' ')
    .find(candidate =>
      document.getElementById(candidate)?.hasAttribute('aria-live')
    )
  const counter = id ? document.getElementById(id) : null
  if (!counter) throw new Error('the counter is part of aria-describedby')
  return counter
}

describe('TextArea', () => {
  it('counter: sits below the field, right-aligned in 12/16 text-secondary, polite and read as "N caracteres"', async () => {
    const user = userEvent.setup()
    render(<TextArea label="Observação" maxLength={10} />)
    const textarea = screen.getByRole('textbox', { name: 'Observação' })

    await user.type(textarea, 'abc')
    const counter = counterOf(textarea)

    expect(counter).toHaveAttribute('aria-live', 'polite')
    expect(counter).toHaveClass('self-end', 'text-size-25', 'text-secondary')
    expect(counter).not.toHaveClass('absolute')
    expect(counter).toHaveTextContent('3/10 caracteres')
    expect(
      textarea.compareDocumentPosition(counter) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(counter.parentElement).toHaveClass('flex-col')
  })

  it('counter: joins an existing helper text in aria-describedby and follows react-hook-form values', async () => {
    const user = userEvent.setup()
    const Form = () => {
      const { control } = useForm({ defaultValues: { nota: 'ab' } })
      return (
        <TextArea
          control={control}
          helperText="Texto de apoio"
          label="Nota"
          maxLength={20}
          name="nota"
        />
      )
    }
    render(<Form />)
    const textarea = screen.getByRole('textbox', { name: 'Nota' })
    const helper = screen.getByText('Texto de apoio').closest('p')

    expect(counterOf(textarea)).toHaveTextContent('2/20 caracteres')
    expect(textarea.getAttribute('aria-describedby')).toContain(
      helper?.id ?? 'missing-helper'
    )

    await user.type(textarea, 'c')

    expect(counterOf(textarea)).toHaveTextContent('3/20 caracteres')
  })

  it('textarea: 4 rows, vertical resize only and 18/28 type', () => {
    render(<TextArea label="Observação" />)
    const textarea = screen.getByRole('textbox', { name: 'Observação' })

    expect(textarea).toHaveAttribute('rows', '4')
    expect(textarea).toHaveClass('resize-y', 'text-size-100')
    expect(textarea).not.toHaveClass('resize')
  })

  it('textarea: shares the field box of the base and has no counter without maxLength', () => {
    render(<TextArea label="Observação" />)
    const textarea = screen.getByRole('textbox', { name: 'Observação' })

    expect(textarea.parentElement).toHaveClass(
      'border',
      'border-control',
      'bg-surface',
      'rounded-2xl',
      'px-4.5',
      'py-3.5'
    )
    expect(textarea).not.toHaveAttribute('aria-describedby')
  })
})
