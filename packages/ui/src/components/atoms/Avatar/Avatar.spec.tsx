import { fireEvent, render, screen } from '@testing-library/react'
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

  it('uses the 12px token at the small size', () => {
    render(<Avatar alt="Pessoa Fictícia" size="small" src="" />)

    expect(screen.getByRole('img')).toHaveClass('size-8', 'text-size-25')
  })

  it.each([
    ['xSmall', ['size-6', 'text-size-25']],
    ['small', ['size-8', 'text-size-25']],
    ['medium', ['size-12', 'text-size-100']],
    ['large', ['size-14', 'text-size-200']],
    ['xLarge', ['size-20', 'text-size-400']]
  ] as const)('sizes: %s measures its Lamb box', (size, expected) => {
    render(<Avatar alt="Pessoa Fictícia" size={size} src="" />)

    expect(screen.getByRole('img')).toHaveClass(...expected)
  })

  it('sizes: defaults to small with the Lamb colours and an inset outline', () => {
    render(<Avatar alt="Pessoa Fictícia" src="" />)

    expect(screen.getByRole('img')).toHaveClass(
      'size-8',
      'rounded-full',
      'bg-neutral-17',
      'text-neutral-100',
      'font-semibold',
      'inset-ring',
      'inset-ring-neutral-17'
    )
  })

  it('sizes: forwards className and other attributes to the wrapper', () => {
    render(
      <Avatar
        alt="Pessoa Fictícia"
        className="shrink-0"
        data-testid="avatar"
        src=""
      />
    )
    const wrapper = screen.getByTestId('avatar')

    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).toHaveClass('shrink-0', 'size-8')
  })

  it.each([
    ['Fulano de Tal Teste', 'FT'],
    ['Fulano', 'F'],
    ['  fulano   de tal ', 'FT']
  ])('initials: "%s" becomes "%s"', (name, expected) => {
    render(<Avatar alt={name} src="" />)

    expect(screen.getByRole('img')).toHaveTextContent(
      new RegExp(`^${expected}$`)
    )
  })

  it('falls back to initials on error', () => {
    render(<Avatar alt="Pessoa Fictícia" src="/fake/avatar.png" />)
    const photo = screen.getByRole('img').querySelector('img')

    expect(photo).not.toBeNull()
    expect(screen.queryByText('PF')).not.toBeInTheDocument()

    if (photo) fireEvent.error(photo)

    expect(screen.getByRole('img').querySelector('img')).toBeNull()
    expect(screen.getByRole('img')).toHaveTextContent('PF')
  })

  it('accessible name comes from alt on the wrapper, with or without a photo', () => {
    const { rerender } = render(
      <Avatar alt="Pessoa Fictícia" src="/fake/avatar.png" />
    )
    const wrapper = screen.getByRole('img', { name: 'Pessoa Fictícia' })
    const photo = wrapper.querySelector('img')

    expect(wrapper).toHaveAttribute('aria-label', 'Pessoa Fictícia')
    expect(photo).toHaveAttribute('alt', '')
    expect(screen.getAllByRole('img')).toHaveLength(1)

    rerender(<Avatar alt="Pessoa Fictícia" src="" />)

    expect(
      screen.getByRole('img', { name: 'Pessoa Fictícia' })
    ).toHaveAttribute('aria-label', 'Pessoa Fictícia')
  })
})
