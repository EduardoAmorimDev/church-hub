import fs from 'node:fs'
import path from 'node:path'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { fullArt } from '@church/ui/atoms/Logo/data'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { StatCard } from '@church/ui/molecules/StatCard'
import { PageHeader } from '@church/ui/organisms/PageHeader'
import type { SideMenuProps } from '@church/ui/organisms/SideMenu'
import { APP_MEDIA_QUERY } from '@church/ui/utils'
import { Page, PageBody } from '.'

const manifestExport = (subpath: string) => {
  const manifest: unknown = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../../package.json'), 'utf8')
  )
  if (typeof manifest !== 'object' || manifest === null) return
  if (!('exports' in manifest)) return
  const { exports } = manifest
  if (typeof exports !== 'object' || exports === null) return
  return Object.entries(exports).find(([key]) => key === subpath)?.[1]
}

// why: jsdom loads no Tailwind CSS, so the Painel/App switch is asserted as
// the classes requested; `narrow` flips matchMedia between App and Painel.
// Reduced motion keeps NavItem's `motion` from measuring layout jsdom lacks.
let narrow = false
const mediaListeners = new Map<
  string,
  Set<EventListenerOrEventListenerObject>
>()

const matchesQuery = (query: string) => {
  if (query.includes('prefers-reduced-motion')) return true
  return narrow && query === APP_MEDIA_QUERY
}

const listenersOf = (query: string) => {
  const listeners = mediaListeners.get(query) ?? new Set()
  mediaListeners.set(query, listeners)
  return listeners
}

const mediaQueryList = (query: string): MediaQueryList => ({
  get matches() {
    return matchesQuery(query)
  },
  media: query,
  onchange: null,
  addEventListener: (
    _type: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    listenersOf(query).add(listener)
  },
  removeEventListener: (
    _type: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    listenersOf(query).delete(listener)
  },
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false
})

// invariant: crossing 960px flips `narrow`, then sends every subscribed query
// a `change` carrying its new `matches`, as a real viewport resize would.
const crossBreakpoint = (toNarrow: boolean) => {
  narrow = toNarrow
  mediaListeners.forEach((listeners, query) => {
    const change = Object.assign(new Event('change'), {
      matches: matchesQuery(query),
      media: query
    })
    listeners.forEach(listener =>
      typeof listener === 'function'
        ? listener(change)
        : listener.handleEvent(change)
    )
  })
  window.dispatchEvent(new Event('resize'))
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: mediaQueryList,
    writable: true
  })
})

afterEach(() => {
  narrow = false
  mediaListeners.clear()
  document.body.style.overflow = ''
})

const PANEL = 'panel:not-in-data-[viewport=mobile]:'
const DESKTOP = 'in-data-[viewport=desktop]:'
const painel = (...utilities: string[]) =>
  utilities.flatMap(utility => [`${PANEL}${utility}`, `${DESKTOP}${utility}`])

// invariant: synthetic data only (constitution, Principle V).
const navOf = (overrides: Partial<SideMenuProps> = {}): SideMenuProps => ({
  items: [
    { iconName: 'home', label: 'Início', activated: true },
    {
      iconName: 'group',
      label: 'Pessoas',
      subItems: [{ label: 'Membros' }, { label: 'Visitantes' }]
    }
  ],
  footerItems: [{ iconName: 'settings', label: 'Configurações' }],
  user: { name: 'Pessoa Exemplo', role: 'Função Exemplo' },
  ...overrides
})

const HEADER = <PageHeader title="Membros" />
const BODY = <p>Conteúdo da página</p>

const rootOf = (container: HTMLElement) => {
  const root = container.firstElementChild
  if (!(root instanceof HTMLElement)) throw new Error('no page root')
  return root
}
const mainOf = () => screen.getByRole('main')
const contentOf = () => {
  const content = mainOf().parentElement
  if (!content) throw new Error('no content area')
  return content
}
const openerOf = () => screen.getByRole('button', { name: 'Abrir menu' })
const drawerOf = () => screen.getByRole('dialog', { name: 'Menu principal' })

describe('Page', () => {
  it('templates export (C2)', async () => {
    const exported: Record<string, unknown> =
      await import('@church/ui/templates/Page')

    expect(manifestExport('./templates/*')).toBe(
      './src/components/templates/*/index.ts'
    )
    expect(typeof exported.Page).toBe('function')
    expect(typeof exported.PageBody).toBe('function')
  })

  it('page shell (C25)', () => {
    const { container, unmount } = render(
      <Page header={HEADER} nav={navOf()}>
        {BODY}
      </Page>
    )
    const root = rootOf(container)
    const aside = screen.getByRole('complementary')
    const content = contentOf()

    expect(root.tagName).toBe('DIV')
    expect(root).toHaveClass(
      'flex',
      'w-full',
      'h-full',
      'min-h-150',
      'bg-page',
      'text-primary',
      ...painel('flex-row')
    )
    expect(aside.parentElement).toBe(root)
    expect(content.parentElement).toBe(root)
    expect(
      aside.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(content).toHaveClass(
      'flex-1',
      'min-w-0',
      'flex',
      'flex-col',
      'overflow-y-auto'
    )
    expect(within(aside).getByRole('button', { name: 'Início' })).toBeVisible()
    unmount()

    const fixed = render(
      <Page nav={navOf()} responsive={false}>
        {BODY}
      </Page>
    )

    expect(rootOf(fixed.container)).toHaveClass('flex', 'min-h-150')
    expect(rootOf(fixed.container)).not.toHaveClass('flex-col')
    fixed.unmount()

    const bare = render(<Page>{BODY}</Page>)

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(rootOf(bare.container)).not.toHaveClass('flex-col')
    expect(contentOf()).toHaveClass('flex-1', 'min-w-0', 'overflow-y-auto')
  })

  it('page shell (C25): nav reaches the SideMenu', () => {
    render(
      <Page nav={navOf({ defaultCollapsed: true, label: 'Navegação' })}>
        {BODY}
      </Page>
    )
    const aside = screen.getByRole('complementary')

    expect(
      within(aside).getByRole('navigation', { name: 'Navegação' })
    ).toBeInTheDocument()
    expect(aside).toHaveClass('w-sidebar-collapsed')
    expect(
      within(aside).getByRole('button', { name: 'Configurações' })
    ).toHaveAttribute('title', 'Configurações')
  })

  it('main landmark (C26)', () => {
    render(
      <>
        <Page header={HEADER}>{BODY}</Page>
        <Page>{BODY}</Page>
      </>
    )
    const [first, second] = screen.getAllByRole('main')
    const heading = screen.getByRole('heading', { name: 'Membros' })

    expect(first?.tagName).toBe('MAIN')
    expect(first).toHaveAttribute('tabindex', '-1')
    expect(first?.id).toBeTruthy()
    expect(second?.id).toBeTruthy()
    expect(first?.id).not.toBe(second?.id)
    expect(first).toHaveClass('w-full', 'max-w-content-max', 'mx-auto')
    expect(first?.firstElementChild).toBe(heading.closest('header'))
    expect(first?.lastElementChild).toBe(
      screen.getAllByText('Conteúdo da página')[0]
    )
  })

  it('skip link (C27)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Page header={HEADER} nav={navOf()}>
        {BODY}
      </Page>
    )
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })

    await user.tab()
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', `#${mainOf().id}`)
    expect(skip).toHaveClass(
      'sr-only',
      'focus:not-sr-only',
      'focus:absolute',
      'focus:z-70',
      'focus:top-2',
      'focus:left-2',
      'focus:px-3',
      'focus:py-2',
      'focus:rounded-lg',
      'focus:bg-action-primary',
      'focus:text-inverse',
      'focus:text-size-50',
      'focus:font-medium'
    )
    unmount()

    render(<Page skipLinkLabel="Ir para o conteúdo">{BODY}</Page>)

    await user.tab()
    expect(
      screen.getByRole('link', { name: 'Ir para o conteúdo' })
    ).toHaveFocus()
  })

  it('panel and app switch (C28)', () => {
    const { container } = render(
      <Page header={HEADER} nav={navOf()}>
        {BODY}
      </Page>
    )
    const root = rootOf(container)
    const aside = screen.getByRole('complementary')
    const opener = openerOf()
    const topBar = opener.parentElement
    const logo = within(topBar ?? document.body).getByRole('img')

    expect(root).toHaveClass('flex-col', ...painel('flex-row'))
    expect(aside).toHaveClass('hidden', ...painel('flex'))
    expect(aside).not.toHaveClass('flex')
    expect(topBar?.parentElement).toBe(contentOf())
    expect(topBar?.nextElementSibling).toBe(mainOf())
    expect(topBar).toHaveClass(
      'flex',
      'h-16',
      'items-center',
      'justify-between',
      'px-5',
      'bg-surface',
      'border-b',
      'border-default',
      ...painel('hidden')
    )
    expect(topBar && Array.from(topBar.children)).toEqual([logo, opener])
    expect(logo).toHaveClass('h-8')
    expect(logo.querySelector('svg')).toHaveAttribute(
      'viewBox',
      fullArt.viewBox
    )
    // invariant: IconButton ghost + neutral + medium (Lamb `low`/`md`).
    expect(opener).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'size-12')
    expect(opener).toHaveTextContent('menu')
    expect(opener).toHaveAttribute('aria-expanded', 'false')
    expect(container.innerHTML).not.toMatch(/(^|[\s"])lg:/)
  })

  it('server markup ignores the viewport (C29)', async () => {
    const consoleError = jest.spyOn(console, 'error')
    const onRecoverableError = jest.fn()
    const tree = (
      <Page header={HEADER} nav={navOf()}>
        <PageBody stats={<StatCard label="Membros ativos" value={128} />}>
          {BODY}
        </PageBody>
      </Page>
    )

    narrow = true
    const appHtml = renderToString(tree)
    narrow = false
    const panelHtml = renderToString(tree)

    expect(appHtml).toBe(panelHtml)
    expect(appHtml).toContain('Abrir menu')
    expect(appHtml).toContain('<aside')

    // why: compared as parsed DOM, since React and the DOM serializer escape
    // quotes in `style` differently.
    const serverDom = document.createElement('div')
    serverDom.innerHTML = panelHtml

    for (const clientNarrow of [true, false]) {
      narrow = clientNarrow
      const container = document.createElement('div')
      container.innerHTML = appHtml
      document.body.appendChild(container)
      const root = await act(async () =>
        hydrateRoot(container, tree, { onRecoverableError })
      )

      expect(onRecoverableError).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
      expect(container.innerHTML).toBe(serverDom.innerHTML)

      act(() => root.unmount())
      container.remove()
    }
    consoleError.mockRestore()
  })

  it('opens the menu drawer (C30)', async () => {
    const user = userEvent.setup()
    const onProfileClick = jest.fn()
    render(
      <Page
        header={HEADER}
        nav={navOf({ label: 'Navegação da igreja', onProfileClick })}
      >
        {BODY}
      </Page>
    )
    const opener = openerOf()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(opener)
    const drawer = screen.getByRole('dialog', { name: 'Navegação da igreja' })

    expect(opener).toHaveAttribute('aria-expanded', 'true')
    expect(drawer).toHaveClass('right-0', 'shadow-elevation-low-left')
    expect(
      within(drawer).getByRole('navigation', { name: 'Navegação da igreja' })
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Início' })
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Pessoas' })
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Configurações' })
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(drawer).getByRole('button', { name: 'Fechar menu' })
      ).toHaveFocus()
    )

    await user.click(
      within(drawer).getByRole('button', { name: /Pessoa Exemplo/ })
    )
    expect(onProfileClick).toHaveBeenCalledTimes(1)

    await user.click(
      within(drawer).getByRole('button', { name: 'Fechar menu' })
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveAttribute('aria-expanded', 'false')
    expect(opener).toHaveFocus()
  })

  it('leaf click closes the drawer (C31)', async () => {
    const user = userEvent.setup()
    const onLeaf = jest.fn()
    const onSubItem = jest.fn()
    const onFooter = jest.fn()
    const onFooterSubItem = jest.fn()
    const onParent = jest.fn()
    const items: NavItemProps[] = [
      { iconName: 'home', label: 'Início', onClick: onLeaf },
      {
        iconName: 'group',
        label: 'Pessoas',
        onClick: onParent,
        subItems: [
          { label: 'Membros', onClick: onSubItem },
          { label: 'Visitantes' }
        ]
      }
    ]
    render(
      <Page
        nav={navOf({
          footerItems: [
            { iconName: 'settings', label: 'Configurações', onClick: onFooter },
            {
              iconName: 'help',
              label: 'Ajuda',
              subItems: [{ label: 'Suporte', onClick: onFooterSubItem }]
            }
          ],
          items
        })}
      >
        {BODY}
      </Page>
    )
    const reopen = async () => {
      await user.click(openerOf())
      return drawerOf()
    }

    let drawer = await reopen()
    await user.click(within(drawer).getByRole('button', { name: 'Início' }))
    expect(onLeaf).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(openerOf()).toHaveFocus()

    drawer = await reopen()
    const parent = within(drawer).getByRole('button', { name: 'Pessoas' })
    await user.click(parent)
    expect(drawerOf()).toBeInTheDocument()
    expect(parent).toHaveAttribute('aria-expanded', 'true')
    expect(onParent).toHaveBeenCalledTimes(1)

    await user.click(parent)
    expect(drawerOf()).toBeInTheDocument()
    expect(parent).toHaveAttribute('aria-expanded', 'false')

    await user.click(parent)
    await user.click(within(drawer).getByRole('button', { name: 'Membros' }))
    expect(onSubItem).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    drawer = await reopen()
    await user.click(
      within(drawer).getByRole('button', { name: 'Configurações' })
    )
    expect(onFooter).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    drawer = await reopen()
    const footerParent = within(drawer).getByRole('button', { name: 'Ajuda' })
    await user.click(footerParent)
    expect(drawerOf()).toBeInTheDocument()
    expect(footerParent).toHaveAttribute('aria-expanded', 'true')
    await user.click(within(drawer).getByRole('button', { name: 'Suporte' }))
    expect(onFooterSubItem).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    drawer = await reopen()
    await user.click(within(drawer).getByRole('button', { name: 'Pessoas' }))
    await user.click(within(drawer).getByRole('button', { name: 'Visitantes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onLeaf).toHaveBeenCalledTimes(1)
    expect(onSubItem).toHaveBeenCalledTimes(1)
    expect(onFooter).toHaveBeenCalledTimes(1)
    expect(onFooterSubItem).toHaveBeenCalledTimes(1)
  })

  it('leaf click closes the drawer (C31): an empty subItems list is a leaf', async () => {
    const user = userEvent.setup()
    const onEmpty = jest.fn()
    const onFooterEmpty = jest.fn()
    render(
      <Page
        nav={navOf({
          footerItems: [
            {
              iconName: 'help',
              label: 'Ajuda',
              onClick: onFooterEmpty,
              subItems: []
            }
          ],
          items: [
            {
              iconName: 'event',
              label: 'Agenda',
              onClick: onEmpty,
              subItems: []
            }
          ]
        })}
      >
        {BODY}
      </Page>
    )

    await user.click(openerOf())
    await user.click(within(drawerOf()).getByRole('button', { name: 'Agenda' }))
    expect(onEmpty).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openerOf())
    await user.click(within(drawerOf()).getByRole('button', { name: 'Ajuda' }))
    expect(onFooterEmpty).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('leaf click closes the drawer (C31): the SideMenu items stay untouched', async () => {
    const user = userEvent.setup()
    const onLeaf = jest.fn()
    render(
      <Page
        nav={navOf({
          items: [{ iconName: 'home', label: 'Início', onClick: onLeaf }]
        })}
      >
        {BODY}
      </Page>
    )

    await user.click(
      within(screen.getByRole('complementary')).getByRole('button', {
        name: 'Início'
      })
    )

    expect(onLeaf).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(openerOf()).toHaveAttribute('aria-expanded', 'false')
  })

  it('non responsive and no nav (C32)', async () => {
    const user = userEvent.setup()
    const { container, unmount } = render(
      <Page header={HEADER} nav={navOf()} responsive={false}>
        {BODY}
      </Page>
    )
    const aside = screen.getByRole('complementary')

    expect(aside).toHaveClass('flex')
    for (const utility of ['hidden', ...painel('flex')])
      expect(aside).not.toHaveClass(utility)
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull()
    expect(rootOf(container)).not.toHaveClass('flex-col')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    unmount()

    const bare = render(<Page header={HEADER}>{BODY}</Page>)

    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(contentOf().firstElementChild).toBe(mainOf())
    expect(rootOf(bare.container).children).toHaveLength(2)
  })

  it('drawer stays open across the breakpoint (C33)', async () => {
    const user = userEvent.setup()
    narrow = true
    render(
      <Page header={HEADER} nav={navOf()}>
        {BODY}
      </Page>
    )

    await user.click(openerOf())
    expect(drawerOf()).toBeInTheDocument()

    act(() => crossBreakpoint(false))

    expect(window.matchMedia(APP_MEDIA_QUERY).matches).toBe(false)
    expect(drawerOf()).toBeInTheDocument()
    expect(openerOf()).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('page body (C34)', () => {
    const { container, unmount } = render(
      <PageBody
        stats={
          <>
            <StatCard label="Membros ativos" value={128} />
            <StatCard label="Visitantes" value={12} />
          </>
        }
      >
        {BODY}
      </PageBody>
    )
    const body = rootOf(container)
    const grid = body.firstElementChild

    expect(body.tagName).toBe('DIV')
    expect(body).toHaveClass(
      'flex',
      'flex-col',
      'gap-4',
      'pt-4',
      'pb-8',
      'px-5',
      ...painel('px-8')
    )
    expect(body).not.toHaveClass('px-8')
    expect(grid).toHaveClass('grid', 'grid-cols-fill-55', 'gap-4')
    expect(grid?.children).toHaveLength(2)
    expect(within(body).getAllByRole('article')).toHaveLength(2)
    expect(grid?.nextElementSibling).toBe(
      screen.getByText('Conteúdo da página')
    )
    unmount()

    const plain = render(<PageBody>{BODY}</PageBody>)

    expect(rootOf(plain.container).firstElementChild).toBe(
      screen.getByText('Conteúdo da página')
    )
    expect(plain.container.querySelector('.grid')).toBeNull()
  })
})
