import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast, toast, ToastContainer } from './Toast'
import meta from './Toast.stories'

const toastElementOf = async (title: string) => {
  const element = (await screen.findByText(title)).closest('.Toastify__toast')
  if (!(element instanceof HTMLElement)) {
    throw new Error(`no toast element holds "${title}"`)
  }
  return element
}

const progressOf = (toastElement: HTMLElement) => {
  const bar = within(toastElement).getByRole('progressbar', { hidden: true })
  if (!(bar instanceof HTMLElement)) throw new Error('no progress bar')
  return bar
}

describe('Toast', () => {
  it('renders title and description', () => {
    render(<Toast description="Descrição fictícia" title="Título fictício" />)

    expect(screen.getByText('Título fictício')).toBeInTheDocument()
    expect(screen.getByText('Descrição fictícia')).toBeInTheDocument()
  })

  it('closes through the toast context', async () => {
    const user = userEvent.setup()
    const closeToast = jest.fn()

    render(<Toast title="Título fictício" toastProps={{ closeToast }} />)
    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }))

    expect(closeToast).toHaveBeenCalledTimes(1)
  })

  it('styles a shown toast with the radius token and its type colour', async () => {
    render(<ToastContainer />)

    act(() => {
      toast.error({ id: 'toast-ficticio', title: 'Falha fictícia' })
    })

    const title = await screen.findByText('Falha fictícia')
    const toastElement = title.closest('.Toastify__toast')

    expect(toastElement).toHaveClass('rounded-10!', 'p-3!', 'bg-danger-solid!')
  })

  it.each([
    ['success', ['bg-positive-solid!', 'text-on-positive!']],
    ['error', ['bg-danger-solid!', 'text-on-danger!']],
    ['warning', ['bg-attention-solid!', 'text-on-attention!']],
    ['info', ['bg-action-primary!', 'text-inverse!']]
  ] as const)('variant colors: %s', async (variant, classes) => {
    render(<ToastContainer />)
    const title = `Cor ${variant} fictícia`

    act(() => {
      toast[variant]({ id: `cor-${variant}`, title })
    })

    expect(await toastElementOf(title)).toHaveClass(...classes)
  })

  it('layout: radius 10, padding 12, max width 320, no min height, elevation shadow, 8px gaps and a 600 14/20 title', async () => {
    render(<ToastContainer />)

    act(() => {
      toast.success({
        id: 'layout-ficticio',
        title: 'Layout fictício',
        description: 'Corpo fictício',
        action: <button type="button">Ação fictícia</button>
      })
    })

    const toastElement = await toastElementOf('Layout fictício')
    const title = screen.getByText('Layout fictício')
    const body = screen.getByText('Corpo fictício')
    const content = title.parentElement?.parentElement

    expect(toastElement).toHaveClass(
      'rounded-10!',
      'p-3!',
      'max-w-80!',
      'min-h-0!',
      'shadow-elevation-high-bottom!'
    )
    expect(content).toHaveClass('flex', 'flex-col', 'gap-2')
    expect(content).toContainElement(body)
    expect(content).toContainElement(screen.getByText('Ação fictícia'))
    expect(title).toHaveClass('font-semibold', 'text-size-50', 'leading-5')
    expect(body.tagName).toBe('P')
  })

  it('layout: renders no description <p> without content', () => {
    const { container } = render(<Toast title="Só título" />)

    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(screen.getByText('Só título').tagName).toBe('P')
  })

  it('close button: 32x32, radius 8, 20px icon, "Fechar notificação", type="button"', () => {
    render(<Toast title="Título fictício" />)
    const close = screen.getByRole('button', { name: 'Fechar notificação' })

    expect(close).toHaveAttribute('type', 'button')
    expect(close).toHaveClass('size-8', 'rounded-lg')
    expect(within(close).getByText('close')).toHaveClass('text-icon-20!')
  })

  it('container: bottom-right region "Notificações", 24px from the edges, 8px stack gap, 6000ms auto close', async () => {
    render(<ToastContainer />)

    act(() => {
      toast.info({ id: 'container-ficticio', title: 'Contêiner fictício' })
    })

    const toastElement = await toastElementOf('Contêiner fictício')
    const region = screen.getByRole('region', { name: 'Notificações' })
    const stack = toastElement.parentElement

    expect(region).toContainElement(toastElement)
    expect(stack).toHaveClass(
      'Toastify__toast-container--bottom-right',
      'right-6!',
      'bottom-6!',
      'gap-2'
    )
    expect(toastElement).toHaveClass('mb-0!')
    expect(progressOf(toastElement).style.animationDuration).toBe('6000ms')
  })

  it('container: the auto close pauses on hover and while focus is inside the toast', async () => {
    // why: jsdom reports a window without focus, which react-toastify reads
    // as focus loss and pauses every toast before the test acts.
    const hasFocus = jest.spyOn(document, 'hasFocus').mockReturnValue(true)
    render(<ToastContainer />)

    act(() => {
      toast.success({ id: 'pausa-ficticia', title: 'Pausa fictícia' })
    })

    const toastElement = await toastElementOf('Pausa fictícia')
    // why: the timer starts when the enter animation ends, an event jsdom
    // never fires on its own.
    fireEvent.animationEnd(toastElement)
    const progress = () => progressOf(toastElement).style.animationPlayState

    expect(progress()).toBe('running')

    fireEvent.mouseEnter(toastElement)
    expect(progress()).toBe('paused')

    fireEvent.mouseLeave(toastElement)
    expect(progress()).toBe('running')

    act(() => {
      within(toastElement)
        .getByRole('button', { name: 'Fechar notificação' })
        .focus()
    })
    expect(progress()).toBe('paused')

    act(() => {
      within(toastElement)
        .getByRole('button', { name: 'Fechar notificação' })
        .blur()
    })
    expect(progress()).toBe('running')
    hasFocus.mockRestore()
  })

  it.each([
    ['error', 'alert'],
    ['success', 'status'],
    ['warning', 'status'],
    ['info', 'status']
  ] as const)(
    'roles: %s is announced with role="%s"',
    async (variant, role) => {
      render(<ToastContainer />)
      const title = `Papel ${variant} fictício`

      act(() => {
        toast[variant]({ id: `papel-${variant}`, title })
      })

      expect(await toastElementOf(title)).toHaveAttribute('role', role)
    }
  )

  it("action button: the story's action is a 32px Button with padding 8/12, radius 8, neutral-999 on neutral-00", () => {
    const action = meta.args?.action

    expect(action).toBeDefined()

    render(<Toast action={action} title="Título fictício" />)
    const button = screen.getByRole('button', { name: 'Desfazer' })

    expect(button).toHaveClass(
      'h-8',
      'py-2',
      'px-3',
      'rounded-lg',
      'bg-neutral-999',
      'text-neutral-00'
    )
  })
})
