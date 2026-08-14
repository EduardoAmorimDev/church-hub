import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@church/ui/atoms/Button'
import { BottomSheet, BottomSheetProps } from '.'
import { shouldDismissSheet, SheetDrag } from './data'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics; computed px live in styles.spec.ts.
const TITLE = 'Marcar presença'

// why: jsdom has no PointerEvent, so React's pointer handlers would read no
// coordinates; a MouseEvent subclass carries clientY and pointerId.
class FakePointerEvent extends MouseEvent {
  pointerId: number
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 1
  }
}

// why: `motion` reads the reduced-motion preference through matchMedia,
// which jsdom does not provide (same stub as NavItem.spec).
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
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: FakePointerEvent
  })
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

afterEach(() => {
  jest.restoreAllMocks()
  setReducedMotion(false)
  document.body.style.overflow = ''
})

// invariant: real time on purpose; motion's frame loop does not advance under
// Jest's fake timers. 16ms is one frame, far below the 200ms spring-back.
const waitOneFrame = () =>
  act(() => new Promise<void>(resolve => setTimeout(resolve, 16)))

const renderSheet = (props: Partial<BottomSheetProps> = {}) =>
  render(<BottomSheet open title={TITLE} {...props} />)

const sheetOf = () => screen.getByRole('dialog', { name: TITLE })
const headingOf = () => screen.getByRole('heading', { name: TITLE })
const rootOf = () => {
  const root = sheetOf().parentElement
  if (!root) throw new Error('no root')
  return root
}
const overlayOf = () => {
  const overlay = rootOf().firstElementChild
  if (!(overlay instanceof HTMLElement)) throw new Error('no overlay')
  return overlay
}
const headerOf = () => {
  const header = headingOf().parentElement
  if (!header) throw new Error('no header')
  return header
}
const grabOf = () => {
  const grab = headerOf().parentElement
  if (!grab) throw new Error('no grab area')
  return grab
}
const handleOf = () => {
  const handle = grabOf().firstElementChild
  if (!(handle instanceof HTMLElement)) throw new Error('no handle')
  return handle
}
const lastOf = () => {
  const last = sheetOf().lastElementChild
  if (!(last instanceof HTMLElement)) throw new Error('empty sheet')
  return last
}
const buttonOf = (name: string) => screen.getByRole('button', { name })

const mockPanelHeight = (px: number) =>
  jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(px)

const dragFrom = (
  target: Element,
  { distance, elapsedMs }: Omit<SheetDrag, 'height'>
) => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(10_000)
  fireEvent.pointerDown(target, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(target, { clientY: 100 + distance, pointerId: 1 })
  now.mockReturnValue(10_000 + elapsedMs)
  fireEvent.pointerUp(target, { clientY: 100 + distance, pointerId: 1 })
  now.mockRestore()
}

class FakeVisualViewport extends EventTarget {
  height: number
  offsetTop = 0
  constructor(height: number) {
    super()
    this.height = height
  }
}

const installViewport = (viewport: FakeVisualViewport) =>
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport
  })

describe('BottomSheet', () => {
  it('sheet markup (C26)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { container, rerender } = render(
      <BottomSheet onClose={onClose} open={false} title={TITLE} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<BottomSheet onClose={onClose} open title={TITLE} />)
    const sheet = sheetOf()

    expect(rootOf()).toHaveClass('fixed', 'inset-0', 'z-55')
    expect(overlayOf()).toHaveClass('absolute', 'inset-0', 'bg-scrim')
    expect(overlayOf()).toHaveAttribute('aria-hidden', 'true')
    expect(sheet).toHaveAttribute('aria-modal', 'true')
    expect(sheet).toHaveAttribute('aria-labelledby', headingOf().id)
    expect(sheet).toHaveClass(
      'absolute',
      'inset-x-0',
      'bottom-0',
      'mx-auto',
      'w-full',
      'max-w-150',
      'max-h-sheet',
      'bg-surface',
      'rounded-t-2xl',
      'shadow-elevation-low-above',
      'flex',
      'flex-col'
    )

    await user.click(overlayOf())
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <BottomSheet dismissible={false} onClose={onClose} open title={TITLE} />
    )
    await user.click(overlayOf())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('detents (C27)', () => {
    const DETENTS: ReadonlyArray<
      [BottomSheetProps['detents'], string | undefined]
    > = [
      [undefined, undefined],
      ['auto', undefined],
      ['half', 'h-1/2'],
      ['full', 'h-sheet']
    ]
    DETENTS.forEach(([detents, height]) => {
      const { unmount } = renderSheet({ detents })
      const others = ['h-1/2', 'h-sheet'].filter(name => name !== height)

      if (height) expect(sheetOf()).toHaveClass(height)
      others.forEach(name => expect(sheetOf()).not.toHaveClass(name))
      unmount()
    })
  })

  it('grab area and header (C28)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { unmount } = renderSheet({ onClose })
    const close = buttonOf('Fechar')

    expect(sheetOf().firstElementChild).toBe(grabOf())
    expect(grabOf()).toHaveClass('pt-2')
    expect(handleOf().tagName).toBe('SPAN')
    expect(handleOf()).toHaveAttribute('aria-hidden', 'true')
    expect(handleOf()).toHaveClass(
      'w-9',
      'h-1',
      'rounded-full',
      'bg-neutral-33',
      'mx-auto',
      'mb-1'
    )
    expect(headerOf()).toHaveClass(
      'flex',
      'items-center',
      'gap-3',
      'pt-1',
      'pr-3',
      'pb-2',
      'pl-5'
    )
    expect(headingOf().tagName).toBe('H2')
    expect(headingOf()).toHaveClass('flex-1', 'text-size-75', 'font-semibold')
    expect(close).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'size-12')
    expect(close).toHaveTextContent('close')

    await user.click(close)
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    renderSheet({ closeLabel: 'Fechar filtros' })
    expect(buttonOf('Fechar filtros')).toBeVisible()
  })

  it('body (C29)', () => {
    renderSheet({ children: <p>Lista de participantes</p> })
    const body = screen.getByText('Lista de participantes').parentElement

    expect(body).toHaveClass(
      'flex',
      'flex-1',
      'min-h-0',
      'flex-col',
      'gap-4',
      'overflow-y-auto',
      'overscroll-contain',
      'pt-2',
      'px-5',
      'pb-4'
    )
  })

  it('footer (C30)', () => {
    renderSheet({ footer: <Button>Salvar presença</Button> })
    const footer = buttonOf('Salvar presença').parentElement

    expect(footer).toHaveClass(
      'flex',
      'flex-col',
      'gap-2',
      'px-5',
      'py-3',
      'border-t',
      'border-default',
      'bg-surface',
      '*:w-full'
    )
  })

  it('safe area (C31)', () => {
    const footerOf = () => buttonOf('Salvar presença').parentElement
    const byDefault = renderSheet({ footer: <Button>Salvar presença</Button> })
    expect(lastOf()).toHaveAttribute('aria-hidden', 'true')
    expect(lastOf()).toHaveClass('h-safe-area')
    expect(lastOf().previousElementSibling).toBe(footerOf())
    byDefault.unmount()

    const env = renderSheet({
      footer: <Button>Salvar presença</Button>,
      safeArea: 'env'
    })
    expect(lastOf()).toHaveClass('h-safe-area')
    env.unmount()

    const mock = renderSheet({
      footer: <Button>Salvar presença</Button>,
      safeArea: 'mock'
    })
    expect(lastOf()).toHaveAttribute('aria-hidden', 'true')
    expect(lastOf()).toHaveClass(
      'h-8.5',
      'flex',
      'items-center',
      'justify-center',
      'before:w-33.5',
      'before:h-1.25',
      'before:rounded-full',
      'before:bg-neutral-999'
    )
    expect(lastOf()).not.toHaveClass('h-safe-area')
    mock.unmount()

    renderSheet({ footer: <Button>Salvar presença</Button>, safeArea: 'none' })
    expect(lastOf()).toBe(footerOf())
  })

  it.each([
    [{ distance: 101, elapsedMs: 1000, height: 400 }, true],
    [{ distance: 100, elapsedMs: 1000, height: 400 }, false],
    [{ distance: 97, elapsedMs: 1000, height: 200 }, true],
    [{ distance: 96, elapsedMs: 1000, height: 200 }, false],
    [{ distance: 301, elapsedMs: 1000, height: 1200 }, true],
    [{ distance: 299, elapsedMs: 1000, height: 1200 }, false],
    [{ distance: 41, elapsedMs: 249, height: 400 }, true],
    [{ distance: 41, elapsedMs: 250, height: 400 }, false],
    [{ distance: 40, elapsedMs: 100, height: 400 }, false]
  ] satisfies ReadonlyArray<[SheetDrag, boolean]>)(
    'drag to dismiss (C32): rule %o dismisses = %s',
    (drag, expected) => {
      expect(shouldDismissSheet(drag)).toBe(expected)
    }
  )

  it('drag to dismiss (C32): releases on the sheet', async () => {
    const onClose = jest.fn()
    mockPanelHeight(400)
    renderSheet({ onClose })

    fireEvent.pointerDown(handleOf(), { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(handleOf(), { clientY: 160, pointerId: 1 })
    await waitFor(() =>
      expect(sheetOf().style.transform).toBe('translateY(60px)')
    )
    fireEvent.pointerMove(handleOf(), { clientY: 40, pointerId: 1 })
    await waitFor(() => expect(sheetOf().style.transform).toBe('none'))
    fireEvent.pointerUp(handleOf(), { clientY: 40, pointerId: 1 })

    dragFrom(headingOf(), { distance: 90, elapsedMs: 1000 })
    expect(onClose).not.toHaveBeenCalled()
    await waitFor(() => expect(sheetOf().style.transform).toBe('none'))

    dragFrom(headingOf(), { distance: 120, elapsedMs: 1000 })
    expect(onClose).toHaveBeenCalledTimes(1)

    dragFrom(handleOf(), { distance: 50, elapsedMs: 200 })
    expect(onClose).toHaveBeenCalledTimes(2)

    dragFrom(handleOf(), { distance: 50, elapsedMs: 300 })
    dragFrom(handleOf(), { distance: 30, elapsedMs: 100 })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('drag to dismiss (C32): the 96px floor on a short sheet', () => {
    const onClose = jest.fn()
    mockPanelHeight(200)
    renderSheet({ onClose })

    dragFrom(handleOf(), { distance: 95, elapsedMs: 1000 })
    expect(onClose).not.toHaveBeenCalled()

    dragFrom(handleOf(), { distance: 97, elapsedMs: 1000 })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('drag to dismiss (C32): a drag that starts on a button does not move the sheet', async () => {
    const onClose = jest.fn()
    mockPanelHeight(400)
    renderSheet({ onClose })
    const close = buttonOf('Fechar')

    fireEvent.pointerDown(close, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(close, { clientY: 400, pointerId: 1 })
    await waitOneFrame()
    expect(sheetOf().style.transform).not.toContain('translateY')
    fireEvent.pointerUp(close, { clientY: 400, pointerId: 1 })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('virtual keyboard offset (C33)', async () => {
    const viewport = new FakeVisualViewport(768)
    installViewport(viewport)
    try {
      renderSheet()
      await waitFor(() => expect(sheetOf().style.bottom).toBe('0px'))

      viewport.height = 468
      act(() => {
        viewport.dispatchEvent(new Event('resize'))
      })
      await waitFor(() => expect(sheetOf().style.bottom).toBe('300px'))

      viewport.offsetTop = 100
      act(() => {
        viewport.dispatchEvent(new Event('scroll'))
      })
      await waitFor(() => expect(sheetOf().style.bottom).toBe('200px'))

      viewport.height = 900
      viewport.offsetTop = 0
      act(() => {
        viewport.dispatchEvent(new Event('resize'))
      })
      await waitFor(() => expect(sheetOf().style.bottom).toBe('0px'))
    } finally {
      Reflect.deleteProperty(window, 'visualViewport')
    }
  })

  it('virtual keyboard offset (C33): without visualViewport the sheet stays at the base', async () => {
    expect(window.visualViewport ?? null).toBe(null)

    expect(() => renderSheet()).not.toThrow()
    await waitOneFrame()
    expect(sheetOf().style.bottom).toBe('0px')
    expect(sheetOf()).toHaveClass('bottom-0')
  })

  it('initial focus and esc (C34)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const autofocus = renderSheet({
      children: (
        <>
          <input aria-label="Nome" />
          <Button data-autofocus="">Pular</Button>
        </>
      )
    })
    await waitFor(() => expect(buttonOf('Pular')).toHaveFocus())
    autofocus.unmount()

    const field = renderSheet({
      children: (
        <>
          <Button>Limpar</Button>
          <input aria-label="Nome" />
        </>
      )
    })
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveFocus()
    )
    field.unmount()

    renderSheet({ children: <p>Nada para preencher.</p>, onClose })
    await waitFor(() => expect(sheetOf()).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('motion (C35)', async () => {
    mockPanelHeight(400)
    const { unmount } = renderSheet()
    const unprefixed = (node: HTMLElement) =>
      Array.from(node.classList).filter(name => name.startsWith('animate-'))

    expect(overlayOf()).toHaveClass('motion-safe:animate-sheet-fade')
    expect(sheetOf()).toHaveClass('motion-safe:animate-sheet-in')
    expect(unprefixed(overlayOf())).toEqual([])
    expect(unprefixed(sheetOf())).toEqual([])

    dragFrom(handleOf(), { distance: 60, elapsedMs: 1000 })
    await waitOneFrame()
    expect(sheetOf().style.transform).toContain('translateY')
    unmount()

    setReducedMotion(true)
    renderSheet()
    dragFrom(handleOf(), { distance: 60, elapsedMs: 1000 })
    await waitOneFrame()
    expect(sheetOf().style.transform).toBe('none')
  })
})
