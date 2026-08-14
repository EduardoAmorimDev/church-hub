import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    ['small', 'text-icon-16'],
    ['medium', 'text-icon-20'],
    ['large', 'text-icon-24']
  ] as const)(
    'size %s sizes the clear icon with %s',
    async (size, expected) => {
      const user = userEvent.setup()
      render(<SearchField label="Buscar" size={size} />)

      await user.type(screen.getByLabelText('Buscar'), 'a')

      expect(screen.getByRole('button', { name: 'Limpar busca' })).toHaveClass(
        expected
      )
    }
  )
})
