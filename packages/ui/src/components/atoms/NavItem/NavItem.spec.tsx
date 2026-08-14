import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { NavItem } from './NavItem'

// why: `motion` animates in JS, outside the CSS reduced-motion rule, and
// reads the preference through matchMedia, which jsdom does not provide.
let prefersReducedMotion = false
const preferenceListeners = new Set<EventListenerOrEventListenerObject>()

const setReducedMotion = (reduce: boolean) => {
  prefersReducedMotion = reduce
  const change = new Event('change')
  preferenceListeners.forEach(listener =>
    typeof listener === 'function'
      ? listener(change)
      : listener.handleEvent(change)
  )
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      get matches() {
        return query.includes('prefers-reduced-motion') && prefersReducedMotion
      },
      media: query,
      onchange: null,
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        preferenceListeners.add(listener)
      },
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        preferenceListeners.delete(listener)
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    })
  })
})

// invariant: real time on purpose; motion's frame loop does not advance under
// Jest's fake timers. 16ms is one frame, far below the 300ms animation.
const waitOneFrame = () =>
  act(() => new Promise<void>(resolve => setTimeout(resolve, 16)))

const expandGroup = () => {
  render(
    <NavItem
      iconName="group"
      label="Membros"
      subItems={[{ label: 'Lista' }, { label: 'Aniversariantes' }]}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Membros' }))
  return screen.getByRole('button', { name: 'Lista' }).closest('ul')
}

describe('NavItem', () => {
  it('reduced motion: the sub-list reaches its final state within a frame', async () => {
    setReducedMotion(true)

    const list = expandGroup()
    await waitOneFrame()

    expect(list).toHaveStyle({ opacity: '1' })
  })

  it('reduced motion off: the same sub-list is still fading in after a frame', async () => {
    setReducedMotion(false)

    const list = expandGroup()
    await waitOneFrame()

    expect(list).not.toHaveStyle({ opacity: '1' })
  })

  const isFilled = (icon: HTMLElement) =>
    icon.style.fontVariationSettings.includes("'FILL' 1")

  it('appearance: 48px mobile box, 32px from lg, text-secondary at rest and bg-hover + text-primary on hover', () => {
    render(<NavItem iconName="home" label="Início" />)
    const button = screen.getByRole('button', { name: 'Início' })

    expect(button).toHaveClass(
      'min-h-12',
      'px-3.5',
      'py-3',
      'rounded-xl',
      'text-size-75',
      'font-medium',
      'lg:min-h-8',
      'lg:px-2.5',
      'lg:py-1.5',
      'lg:rounded-lg',
      'lg:text-size-50',
      'text-secondary',
      'hover:bg-hover',
      'hover:text-primary'
    )
    expect(screen.getByText('home')).toHaveClass(
      'text-current',
      'text-icon-24!',
      'lg:text-icon-20!'
    )
  })

  it('activated: bg-selected, text-primary, filled icon and aria-current="page"', () => {
    render(<NavItem activated iconName="home" label="Início" />)
    const button = screen.getByRole('button', { name: 'Início' })

    expect(button).toHaveClass('bg-selected', 'text-primary')
    expect(button).toHaveAttribute('aria-current', 'page')
    expect(isFilled(screen.getByText('home'))).toBe(true)
  })

  it('selected: filled icon and text-primary without background or aria-current', () => {
    render(<NavItem iconName="home" label="Início" selected />)
    const button = screen.getByRole('button', { name: 'Início' })

    expect(button).toHaveClass('text-primary')
    expect(button).not.toHaveClass('bg-selected', 'text-secondary')
    expect(button).not.toHaveAttribute('aria-current')
    expect(isFilled(screen.getByText('home'))).toBe(true)
  })

  it('selected: the parent of an activated sub-item is on the trail, not the current page', () => {
    render(
      <NavItem
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros', activated: true }]}
      />
    )
    const parent = screen.getByRole('button', { name: 'Pessoas' })

    expect(parent).toHaveClass('text-primary')
    expect(parent).not.toHaveClass('bg-selected')
    expect(parent).not.toHaveAttribute('aria-current')
    expect(isFilled(screen.getByText('group'))).toBe(true)
    expect(screen.getByRole('button', { name: 'Membros' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('blur keeps state: a leaf that loses focus neither turns active nor stops being active', () => {
    render(
      <ul>
        <NavItem iconName="home" label="Início" />
        <NavItem activated iconName="event" label="Agenda" />
      </ul>
    )
    const idle = screen.getByRole('button', { name: 'Início' })
    const current = screen.getByRole('button', { name: 'Agenda' })

    fireEvent.focus(idle)
    fireEvent.blur(idle)
    fireEvent.focus(current)
    fireEvent.blur(current)

    expect(idle).not.toHaveAttribute('aria-current')
    expect(idle).not.toHaveClass('bg-selected')
    expect(isFilled(screen.getByText('home'))).toBe(false)
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveClass('bg-selected')
  })

  it('expanded: aria-expanded and aria-controls point to the sub-list, no aria-haspopup, 20px chevron turns 180deg in 200ms, icon stays outlined', () => {
    render(
      <NavItem
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros' }, { label: 'Visitantes' }]}
      />
    )
    const button = screen.getByRole('button', { name: 'Pessoas' })
    const chevron = within(button).getByText('keyboard_arrow_down')

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(chevron).toHaveClass(
      'text-icon-20!',
      'transition-transform',
      'duration-200',
      'rotate-0'
    )

    fireEvent.click(button)

    const list = screen.getByRole('button', { name: 'Membros' }).closest('ul')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', list?.id)
    expect(list?.id).toBeTruthy()
    expect(button).not.toHaveAttribute('aria-haspopup')
    expect(chevron).toHaveClass('rotate-180')
    expect(isFilled(screen.getByText('group'))).toBe(false)
  })

  it('sub-item: 38px left padding and an always-visible 4px dot 19px from the edge, with no vertical guide line', () => {
    render(
      <NavItem
        iconName="group"
        label="Pessoas"
        subItems={[
          { label: 'Membros', activated: true },
          { label: 'Visitantes' }
        ]}
      />
    )
    const idle = screen.getByRole('button', { name: 'Visitantes' })
    const current = screen.getByRole('button', { name: 'Membros' })
    const list = idle.closest('ul')

    for (const subItem of [idle, current]) {
      expect(subItem).toHaveClass(
        'pl-9.5',
        'before:left-4.75',
        'before:size-1',
        'before:rounded-full',
        'before:bg-current'
      )
    }
    expect(current).toHaveClass('bg-selected', 'text-primary')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(idle).toHaveClass('text-secondary')
    expect(list?.className ?? '').not.toMatch(/before:/)
  })

  it('collapsed: only the icon, 32px wide, with the label as aria-label and title', () => {
    const { rerender } = render(
      <NavItem collapsed iconName="home" label="Início" />
    )
    const button = screen.getByRole('button', { name: 'Início' })

    expect(screen.queryByText('Início')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Início')
    expect(button).toHaveAttribute('title', 'Início')
    expect(button).toHaveClass('w-8', 'min-h-8', 'p-1.5', 'justify-center')
    expect(screen.getByText('home')).toHaveClass('text-icon-20!')

    rerender(<NavItem iconName="home" label="Início" />)

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).not.toHaveAttribute('title')
  })
})
