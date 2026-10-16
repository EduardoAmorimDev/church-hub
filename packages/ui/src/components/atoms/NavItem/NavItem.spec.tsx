import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement } from 'react'
import { NavItem } from './NavItem'
import { NavItemProps } from './NavItem.types'

type NextLink = (typeof import('next/link'))['default']
type LinkSpy = jest.Mock<(props: ComponentProps<NextLink>) => ReactElement>

// why: an `<a href>` looks the same in the DOM, so only a spy on `next/link`
// proves the Next link is what renders (criterion 6).
jest.mock('next/link', () => {
  const actual = jest.requireActual<typeof import('next/link')>('next/link')
  const { createElement } = jest.requireActual<typeof import('react')>('react')
  return {
    ...actual,
    __esModule: true,
    default: jest.fn((props: ComponentProps<NextLink>) =>
      createElement(actual.default, props)
    )
  }
})

const linkSpy = () =>
  jest.requireMock<{ default: LinkSpy }>('next/link').default
const linkHrefs = () => linkSpy().mock.calls.map(([props]) => props.href)

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

  it('appearance: text-secondary at rest and bg-hover + text-primary on hover', () => {
    render(<NavItem iconName="home" label="Início" />)
    const button = screen.getByRole('button', { name: 'Início' })

    expect(button).toHaveClass(
      'font-medium',
      'text-secondary',
      'hover:bg-hover',
      'hover:text-primary'
    )
    expect(screen.getByText('home')).toHaveClass('text-current')
  })

  // invariant: criterion 3 of `.tasks/lamb-page-shell.md`. Base = App (by
  // width, or under `[data-viewport="mobile"]`), `panel:` = Painel by width,
  // `in-data-[viewport=desktop]:` = Painel forced by an ancestor.
  const PANEL = 'panel:not-in-data-[viewport=mobile]:'
  const DESKTOP = 'in-data-[viewport=desktop]:'
  const panel = (...utilities: string[]) =>
    utilities.flatMap(utility => [`${PANEL}${utility}`, `${DESKTOP}${utility}`])

  it('density switches at the panel breakpoint (C3)', () => {
    const { container, unmount } = render(
      <ul>
        <NavItem iconName="home" label="Início" />
        <NavItem
          iconName="group"
          label="Pessoas"
          subItems={[{ label: 'Membros', activated: true }]}
        />
      </ul>
    )
    const leaf = screen.getByRole('button', { name: 'Início' })
    const subItem = screen.getByRole('button', { name: 'Membros' })

    for (const item of [leaf, subItem]) {
      expect(item).toHaveClass(
        'min-h-12',
        'py-3',
        'rounded-xl',
        'text-size-75',
        'font-medium',
        ...panel('min-h-8', 'py-1.5', 'rounded-lg', 'text-size-50')
      )
    }
    expect(leaf).toHaveClass('px-3.5', ...panel('px-2.5'))
    expect(subItem).toHaveClass('pr-3.5', ...panel('pr-2.5'))
    expect(screen.getByText('home')).toHaveClass(
      'text-icon-24!',
      ...panel('text-icon-20!')
    )
    expect(container.innerHTML).not.toMatch(/(^|[\s"])lg:/)
    unmount()

    const { container: collapsedContainer } = render(
      <ul>
        <NavItem collapsed iconName="home" label="Início" />
        <NavItem
          collapsed
          iconName="group"
          label="Pessoas"
          subItems={[{ label: 'Membros' }]}
        />
      </ul>
    )
    const collapsed = screen.getByRole('button', { name: 'Início' })
    fireEvent.click(screen.getByRole('button', { name: 'Pessoas' }))
    const popupItem = screen.getByRole('button', { name: 'Membros' })

    expect(collapsed).toHaveClass('w-8', 'min-h-8', 'p-1.5', ...panel('p-1.5'))
    expect(collapsed).not.toHaveClass(...panel('px-2.5'))
    expect(popupItem).toHaveClass('text-size-75', ...panel('text-size-50'))
    expect(collapsedContainer.innerHTML).not.toMatch(/(^|[\s"])lg:/)
  })

  it('fills the container width (C4)', () => {
    render(
      <NavItem
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros', activated: true }]}
      />
    )
    const button = screen.getByRole('button', { name: 'Pessoas' })
    const root = button.closest('li')

    expect(root).toHaveClass('w-full')
    expect(root).not.toHaveClass('w-50')
    expect(button).toHaveClass('w-full')
    expect(screen.getByRole('button', { name: 'Membros' })).toHaveClass(
      'w-full'
    )
  })

  it('collapsed branch is highlighted (C5)', () => {
    const { rerender } = render(
      <NavItem
        collapsed
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros', activated: true }]}
      />
    )
    const parent = screen.getByRole('button', { name: 'Pessoas' })

    expect(parent).toHaveClass('bg-selected', 'text-primary')
    expect(parent).not.toHaveAttribute('aria-current')
    expect(isFilled(screen.getByText('group'))).toBe(true)

    rerender(
      <NavItem
        collapsed
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros' }]}
      />
    )

    expect(parent).not.toHaveClass('bg-selected')
    expect(parent).not.toHaveAttribute('aria-current')
    expect(isFilled(screen.getByText('group'))).toBe(false)
  })

  // why: jsdom does not implement navigation; the handler cancels it so the
  // click only proves that `onClick` runs.
  const clickHandler = () =>
    jest.fn((event: React.MouseEvent) => event.preventDefault())

  it('renders a next link with href (C6)', () => {
    linkSpy().mockClear()
    const onLeaf = clickHandler()
    const { rerender } = render(
      <ul>
        <NavItem activated href="/inicio" iconName="home" label="Início" />
        <NavItem activated iconName="event" label="Agenda" />
      </ul>
    )
    const link = screen.getByRole('link', { name: 'Início' })
    const button = screen.getByRole('button', { name: 'Agenda' })

    expect(link.tagName).toBe('A')
    expect(linkHrefs()).toEqual(['/inicio'])
    expect(link).toHaveAttribute('href', '/inicio')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link.className).toBe(button.className)
    expect(button).toHaveAttribute('type', 'button')

    rerender(
      <ul>
        <NavItem
          collapsed
          href="/inicio"
          iconName="home"
          label="Início"
          onClick={onLeaf}
        />
      </ul>
    )
    const collapsedLink = screen.getByRole('link', { name: 'Início' })

    expect(linkHrefs().at(-1)).toBe('/inicio')
    expect(collapsedLink).toHaveAttribute('aria-label', 'Início')
    expect(collapsedLink).toHaveAttribute('title', 'Início')
    expect(collapsedLink).not.toHaveAttribute('aria-current')
    fireEvent.click(collapsedLink)
    expect(onLeaf).toHaveBeenCalledTimes(1)
  })

  it('renders a next link with href (C6): sub-items inline and in the pop-up', () => {
    const onSub = clickHandler()
    const subItems = [
      { label: 'Membros', href: '/membros', activated: true, onClick: onSub },
      { label: 'Visitantes' }
    ]
    linkSpy().mockClear()
    const { unmount } = render(
      <NavItem iconName="group" label="Pessoas" subItems={subItems} />
    )
    const inline = screen.getByRole('link', { name: 'Membros' })
    const sibling = screen.getByRole('button', { name: 'Visitantes' })

    expect(linkHrefs()).toEqual(['/membros'])
    expect(inline).toHaveAttribute('href', '/membros')
    expect(inline).toHaveAttribute('aria-current', 'page')
    expect(inline).toHaveClass('pl-9.5', 'before:size-1', 'bg-selected')
    expect(sibling).toHaveAttribute('type', 'button')
    fireEvent.click(inline)
    expect(onSub).toHaveBeenCalledTimes(1)
    unmount()

    render(
      <NavItem collapsed iconName="group" label="Pessoas" subItems={subItems} />
    )
    linkSpy().mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Pessoas' }))
    const popup = screen.getByRole('link', { name: 'Membros' })

    expect(linkHrefs()).toContain('/membros')
    const popupSibling = screen.getByRole('button', { name: 'Visitantes' })

    expect(popup).toHaveAttribute('href', '/membros')
    expect(popup).toHaveAttribute('aria-current', 'page')
    expect(popup.className).toBe(popupSibling.className)
    fireEvent.click(popup)
    expect(onSub).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: 'Pessoas' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('renders a next link with href (C6): a parent with sub-items stays an expanding button', () => {
    // @ts-expect-error: an item with sub-items does not accept href
    const parent: NavItemProps = {
      href: '/pessoas',
      iconName: 'group',
      label: 'Pessoas',
      subItems: [{ label: 'Membros' }]
    }
    render(<NavItem {...parent} />)
    const button = screen.getByRole('button', { name: 'Pessoas' })

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(button).not.toHaveAttribute('href')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Membros' })).toBeInTheDocument()
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

  it('sub-item: 38px left padding and a 4px dot 19px from the edge, dot only on the activated sub-item', () => {
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
    const dot = [
      'before:left-4.75',
      'before:size-1',
      'before:rounded-full',
      'before:bg-current'
    ]

    expect(idle).toHaveClass('pl-9.5', 'text-secondary')
    for (const token of dot) expect(idle).not.toHaveClass(token)
    expect(current).toHaveClass('pl-9.5', ...dot)
    expect(current).toHaveClass('bg-selected', 'text-primary')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('sub-list: a 1px neutral-17 vertical guide line down the dot column, from under the parent', () => {
    render(
      <NavItem
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros' }, { label: 'Visitantes' }]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pessoas' }))
    const list = screen.getByRole('button', { name: 'Membros' }).closest('ul')

    expect(list).toHaveClass(
      'relative',
      'before:absolute',
      'before:inset-y-0',
      'before:left-4.75',
      'before:w-px',
      'before:bg-neutral-17'
    )
    // invariant: the 4px gap above the first sub-item is padding inside the
    // list, so the line covers it (`Rectangle 1`: 1×144 for 4 sub-items).
    expect(list).toHaveClass('pt-1')
    expect(list).not.toHaveClass('mt-1')
  })

  it('collapsed: the sub-item pop-up has no guide line and no dot', () => {
    render(
      <NavItem
        collapsed
        iconName="group"
        label="Pessoas"
        subItems={[{ label: 'Membros', activated: true }, { label: 'GCs' }]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pessoas' }))
    const current = screen.getByRole('button', { name: 'Membros' })
    const list = current.closest('ul')

    expect(list?.className ?? '').not.toMatch(/before:/)
    expect(current.className).not.toMatch(/before:/)
    expect(screen.getByRole('button', { name: 'GCs' }).className).not.toMatch(
      /before:/
    )
  })

  it('C4 popup focus: Tab into a sub-item keeps the pop-up open, Tab out of the item closes it', async () => {
    const user = userEvent.setup()
    render(
      <ul>
        <NavItem
          collapsed
          iconName="group"
          label="Pessoas"
          subItems={[{ label: 'Membros' }, { label: 'GCs' }]}
        />
        <NavItem collapsed iconName="home" label="Início" />
      </ul>
    )
    const trigger = screen.getByRole('button', { name: 'Pessoas' })

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.tab()
    expect(screen.getByRole('button', { name: 'Membros' })).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Início' })).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Membros' })
      ).not.toBeInTheDocument()
    )
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

  it('count badge (C96)', () => {
    const { rerender } = render(
      <NavItem count={3} iconName="notifications" label="Avisos" />
    )
    const button = screen.getByRole('button', { name: 'Avisos 3 novos' })
    const label = within(button).getByText('Avisos')
    const badge = label.nextElementSibling

    expect(label).toHaveClass('flex-1')
    expect(badge).toHaveClass('bg-danger-solid')
    expect(badge?.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      /^3$/
    )
    expect(within(button).getByText('3 novos')).toHaveClass('sr-only')

    rerender(<NavItem count={0} iconName="notifications" label="Avisos" />)
    expect(screen.queryByText(/novos/)).not.toBeInTheDocument()

    rerender(<NavItem iconName="notifications" label="Avisos" />)
    expect(screen.queryByText(/novos/)).not.toBeInTheDocument()

    rerender(
      <NavItem collapsed count={3} iconName="notifications" label="Avisos" />
    )
    expect(screen.getByRole('button', { name: 'Avisos' })).toBeInTheDocument()
    expect(screen.queryByText(/novos/)).not.toBeInTheDocument()
  })
})
