import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows the initials when there is no image', () => {
    render(<Avatar alt="Pessoa Fictícia" src="" />)

    expect(
      screen.getByRole('img', { name: 'Pessoa Fictícia' })
    ).toHaveTextContent('PF')
  })

  it('ignores repeated spaces in the name', () => {
    render(<Avatar alt="  Pessoa   Fictícia " src="" />)

    expect(screen.getByRole('img')).toHaveTextContent('PF')
  })

  it('renders nothing but the box for an empty name', () => {
    render(<Avatar alt="" src="" />)

    expect(screen.getByRole('img')).toHaveTextContent('')
  })

  it('uses the 11px token at the small size', () => {
    render(<Avatar alt="Pessoa Fictícia" size="small" src="" />)

    expect(screen.getByRole('img')).toHaveClass('w-6', 'h-6', 'text-size-10')
  })
})
