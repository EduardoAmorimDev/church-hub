import { render, screen, within } from '@testing-library/react'
import { Navigation } from './Navigation'

// why: `motion` (inside NavItem) reads the reduced-motion preference through
// matchMedia, which jsdom does not provide.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  })
})

describe('Navigation', () => {
  it('forwards count (C96)', () => {
    render(
      <Navigation
        items={[
          { count: 3, iconName: 'notifications', label: 'Avisos' },
          { iconName: 'group', label: 'Membros' }
        ]}
      />
    )
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })
    const avisos = within(nav).getByRole('button', { name: 'Avisos 3 novos' })

    expect(within(avisos).getByText('3 novos')).toHaveClass('sr-only')
    expect(
      within(nav).getByRole('button', { name: 'Membros' })
    ).toBeInTheDocument()
    expect(within(nav).getAllByText(/novos/)).toHaveLength(1)
  })
})
