import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { TextField } from './TextField'

const boxOf = (input: HTMLElement) => {
  const box = input.parentElement
  if (!box) throw new Error('TextField renders its input inside a box')
  return box
}

const helperOf = (text: string) => {
  const helper = screen.getByText(text).closest('p')
  if (!helper) throw new Error('helper text renders inside a <p>')
  return helper
}

describe('TextField', () => {
  // why: danger-solid resolves to red-67 in both themes, so the field's
  // border and 1px shadow use the primitive utility for that colour.
  it('error state: danger-solid border and 1px shadow, aria-invalid, filled 16px error icon and text-danger helper, no icon in the field', () => {
    render(
      <TextField
        helperText="Informe um email válido"
        label="Email"
        state="error"
      />
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    const box = boxOf(input)
    const helper = helperOf('Informe um email válido')
    const helperIcon = within(helper).getByText('error')

    expect(box).toHaveClass('border', 'border-red-67', 'ring-1', 'ring-red-67')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(helper).toHaveClass('text-danger')
    expect(helperIcon).toHaveClass('text-icon-16!')
    expect(helperIcon.style.fontVariationSettings).toContain("'FILL' 1")
    expect(within(box).queryByText('error')).not.toBeInTheDocument()
  })

  // why: positive-solid resolves to green-83 in both themes.
  it('success state: positive-solid border and a check_circle helper in text-positive', () => {
    render(<TextField helperText="Tudo certo" label="Email" state="success" />)
    const input = screen.getByRole('textbox', { name: 'Email' })
    const box = boxOf(input)
    const helper = helperOf('Tudo certo')

    expect(box).toHaveClass('border', 'border-green-83')
    expect(box).not.toHaveClass('ring-1')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(helper).toHaveClass('text-positive')
    expect(within(helper).getByText('check_circle')).toBeInTheDocument()
    expect(within(box).queryByText('check')).not.toBeInTheDocument()
  })

  it.each([
    ['small', 'text-size-25', 'gap-1'],
    ['medium', 'text-size-75', 'gap-1.5'],
    ['large', 'text-size-75', 'gap-2']
  ] as const)(
    'label: %s renders a 400 text-primary label with its size and gap',
    (size, labelSize, gap) => {
      const { container } = render(<TextField label="Nome" size={size} />)
      const label = screen.getByText('Nome')

      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveClass('font-normal', 'text-primary', labelSize)
      expect(container.firstElementChild).toHaveClass('flex', 'flex-col', gap)
    }
  )

  it('label: optional shows "(Opcional)" in 14px text-secondary at the end, without asterisk or aria-required', () => {
    render(<TextField label="Apelido" optional />)
    const note = screen.getByText('(Opcional)')

    expect(note).toHaveClass('ml-auto', 'text-size-50', 'text-secondary')
    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Apelido' })
    ).not.toHaveAttribute('aria-required')
  })

  it('required marker: by default a hidden text-danger asterisk sits beside the label and the input is aria-required', () => {
    render(<TextField label="Nome" />)
    const label = screen.getByText('Nome')
    const asterisk = screen.getByText('*')

    expect(label).not.toContainElement(asterisk)
    expect(asterisk.parentElement).toBe(label.parentElement)
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
    expect(asterisk).toHaveClass('text-danger')
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveAttribute(
      'aria-required',
      'true'
    )
  })

  it.each([
    ['small', ['text-size-25']],
    ['medium', ['text-size-50', 'leading-5']],
    ['large', ['text-size-50', 'leading-5']]
  ] as const)(
    'helper text: %s renders a text-secondary <p> linked by aria-describedby',
    (size, typeClasses) => {
      render(<TextField helperText="Texto de apoio" label="Nome" size={size} />)
      const helper = helperOf('Texto de apoio')

      expect(helper).toHaveClass('text-secondary', ...typeClasses)
      expect(helper.id).not.toBe('')
      expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveAttribute(
        'aria-describedby',
        helper.id
      )
      expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
        'Texto de apoio'
      )
    }
  )

  it('password toggle: "Mostrar senha"/"Ocultar senha" with aria-pressed, visibility icons and no lock', async () => {
    const user = userEvent.setup()
    const { container } = render(<TextField label="Senha" type="password" />)
    const input = screen.getByLabelText('Senha')

    const show = screen.getByRole('button', { name: 'Mostrar senha' })
    expect(show).toHaveAttribute('aria-pressed', 'false')
    expect(within(show).getByText('visibility')).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')

    await user.click(show)

    const hide = screen.getByRole('button', { name: 'Ocultar senha' })
    expect(hide).toHaveAttribute('aria-pressed', 'true')
    expect(within(hide).getByText('visibility_off')).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(container).not.toHaveTextContent('lock')
  })

  it('unique ids: two react-hook-form fields with the same name get different ids', () => {
    const Form = () => {
      const { control } = useForm({ defaultValues: { email: '' } })
      return <TextField control={control} label="Email" name="email" />
    }
    render(
      <>
        <Form />
        <Form />
      </>
    )
    const [first, second] = screen.getAllByRole('textbox', { name: 'Email' })

    expect(first?.id).toBeTruthy()
    expect(second?.id).toBeTruthy()
    expect(first?.id).not.toBe(second?.id)
  })

  it('unique ids: unbound fields get distinct ids from useId', () => {
    render(
      <>
        <TextField label="Cidade" />
        <TextField label="Cidade" />
      </>
    )
    const [first, second] = screen.getAllByRole('textbox', { name: 'Cidade' })

    expect(first?.id).toBeTruthy()
    expect(first?.id).not.toBe(second?.id)
  })
})
