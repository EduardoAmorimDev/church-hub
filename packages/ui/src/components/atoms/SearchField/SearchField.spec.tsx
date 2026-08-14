import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { SearchField } from './SearchField'

describe('SearchField', () => {
  it('shows the clear button only once there is a value', async () => {
    const user = userEvent.setup()
    render(<SearchField label="Buscar" />)

    expect(
      screen.queryByRole('button', { name: 'Limpar busca' })
    ).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Buscar'), 'termo fictício')

    expect(
      screen.getByRole('button', { name: 'Limpar busca' })
    ).toBeInTheDocument()
  })

  it('clears the value', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<SearchField label="Buscar" onChange={onChange} />)
    const input = screen.getByLabelText('Buscar')

    await user.type(input, 'abc')
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

    expect(input).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: { value: '' } })
    )
  })

  it.each([
    ['small', 'text-icon-16!'],
    ['medium', 'text-icon-20!'],
    ['large', 'text-icon-24!']
  ] as const)(
    'size %s sizes the clear icon with %s',
    async (size, expected) => {
      const user = userEvent.setup()
      render(<SearchField label="Buscar" size={size} />)

      await user.type(screen.getByLabelText('Buscar'), 'a')

      const button = screen.getByRole('button', { name: 'Limpar busca' })
      expect(within(button).getByText('close')).toHaveClass(expected)
    }
  )

  describe('search landmark', () => {
    it('wraps the field in role="search" and names an unlabelled input "Buscar"', () => {
      render(<SearchField />)
      const landmark = screen.getByRole('search')
      const input = within(landmark).getByRole('searchbox', { name: 'Buscar' })

      expect(input).toHaveAttribute('aria-label', 'Buscar')
      expect(input).toHaveAttribute('placeholder', 'Buscar')
    })

    it('uses the visible label as the name when there is one', () => {
      render(<SearchField label="Buscar membro" />)

      expect(
        screen.getByRole('searchbox', { name: 'Buscar membro' })
      ).not.toHaveAttribute('aria-label')
    })
  })

  describe('keyboard', () => {
    it('Enter calls onSearch with the current value', async () => {
      const user = userEvent.setup()
      const onSearch = jest.fn()
      render(<SearchField onSearch={onSearch} />)

      await user.type(screen.getByRole('searchbox'), 'termo{Enter}')

      expect(onSearch).toHaveBeenCalledWith('termo')
    })

    it('Escape clears the field and calls onClear', async () => {
      const user = userEvent.setup()
      const onClear = jest.fn()
      render(<SearchField onClear={onClear} />)
      const input = screen.getByRole('searchbox')

      await user.type(input, 'termo{Escape}')

      expect(input).toHaveValue('')
      expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('Enter and Escape work in react-hook-form mode too', async () => {
      const user = userEvent.setup()
      const onSearch = jest.fn()
      const onClear = jest.fn()
      const Form = () => {
        const { control } = useForm({ defaultValues: { busca: '' } })
        return (
          <SearchField
            control={control}
            name="busca"
            onClear={onClear}
            onSearch={onSearch}
          />
        )
      }
      render(<Form />)
      const input = screen.getByRole('searchbox')

      await user.type(input, 'nome{Enter}')
      expect(onSearch).toHaveBeenCalledWith('nome')

      await user.keyboard('{Escape}')
      expect(input).toHaveValue('')
      expect(onClear).toHaveBeenCalledTimes(1)
    })
  })

  describe('clear button', () => {
    it('is a single "Limpar busca" button that clears and calls onClear', async () => {
      const user = userEvent.setup()
      const onClear = jest.fn()
      render(<SearchField onClear={onClear} />)
      const input = screen.getByRole('searchbox')

      await user.type(input, 'abc')

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveAccessibleName('Limpar busca')

      await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

      expect(input).toHaveValue('')
      expect(onClear).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('is absent while disabled, even with a value, in both modes', () => {
      const Form = () => {
        const { control } = useForm({ defaultValues: { busca: 'nome' } })
        return (
          <SearchField
            control={control}
            disabled
            label="Com form"
            name="busca"
          />
        )
      }
      render(
        <>
          <SearchField defaultValue="nome" disabled label="Sem form" />
          <Form />
        </>
      )

      expect(screen.getByLabelText('Sem form')).toHaveValue('nome')
      expect(screen.getByLabelText('Com form')).toHaveValue('nome')
      expect(screen.getByLabelText('Com form')).toBeDisabled()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('is labelled "Limpar busca" in react-hook-form mode and clears the form value', async () => {
      const user = userEvent.setup()
      const Form = () => {
        const { control } = useForm({ defaultValues: { busca: '' } })
        return <SearchField control={control} name="busca" />
      }
      render(<Form />)
      const input = screen.getByRole('searchbox')

      expect(screen.queryByRole('button')).not.toBeInTheDocument()

      await user.type(input, 'abc')
      await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

      expect(input).toHaveValue('')
    })

    it.each([
      ['small', 'text-icon-16!', ['text-icon-20!', 'text-icon-24!']],
      ['medium', 'text-icon-20!', ['text-icon-16!', 'text-icon-24!']],
      ['large', 'text-icon-24!', ['text-icon-16!', 'text-icon-20!']]
    ] as const)(
      'draws its icon at the %s size (%s)',
      (size, expected, others) => {
        render(<SearchField defaultValue="abc" size={size} />)
        const icon = within(
          screen.getByRole('button', { name: 'Limpar busca' })
        ).getByText('close')

        expect(icon).toHaveClass(expected)
        expect(icon).not.toHaveClass(...others)
      }
    )

    it('hides the browser native clear "x" of the search input', () => {
      render(<SearchField />)
      const input = screen.getByRole('searchbox')

      expect(input).toHaveAttribute('type', 'search')
      expect(input.parentElement).toHaveClass(
        '[&_input::-webkit-search-cancel-button]:appearance-none'
      )
    })
  })
})
