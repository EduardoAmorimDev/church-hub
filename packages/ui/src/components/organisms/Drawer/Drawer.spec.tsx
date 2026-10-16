import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@church/ui/atoms/Button'
import { IconButton } from '@church/ui/atoms/IconButton'
import { Icon } from '@church/ui/atoms/Icon'
import { Drawer, DrawerProps } from '.'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics; computed px live in styles.spec.ts.
const TITLE = 'Pessoa Exemplo'

const renderDrawer = (props: Partial<DrawerProps> = {}) =>
  render(<Drawer title={TITLE} {...props} />)

const dialogOf = () => screen.getByRole('dialog', { name: TITLE })
const headingOf = () => screen.getByRole('heading', { name: TITLE })
const headerOf = () => {
  const header = headingOf().parentElement?.parentElement
  if (!header) throw new Error('no header')
  return header
}
const bodyOf = () => screen.getByRole('group', { name: 'Conteúdo' })
const buttonOf = (name: string) => screen.getByRole('button', { name })
const scrimOf = (container: HTMLElement) => {
  const scrim = container.firstElementChild
  if (!(scrim instanceof HTMLElement)) throw new Error('no scrim')
  return scrim
}

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Drawer', () => {
  it('modal drawer (C18)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { container } = renderDrawer({
      description: 'Membro desde 2020',
      onClose
    })
    const scrim = scrimOf(container)
    const dialog = dialogOf()
    const description = screen.getByText('Membro desde 2020')

    expect(scrim).toHaveClass('fixed', 'inset-0', 'z-40', 'bg-scrim')
    expect(scrim).toHaveAttribute('aria-hidden', 'true')
    expect(scrim.nextElementSibling).toBe(dialog)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', headingOf().id)
    expect(dialog).toHaveAttribute('aria-describedby', description.id)
    expect(dialog).toHaveClass(
      'fixed',
      'z-41',
      'top-6',
      'right-6',
      'bottom-6',
      'w-drawer',
      'max-w-drawer-modal',
      'bg-surface',
      'rounded-3xl',
      'shadow-elevation-high-left',
      'overflow-hidden',
      'flex',
      'flex-col'
    )

    await user.click(scrim)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('modal drawer (C18): no description, no aria-describedby', () => {
    renderDrawer()

    expect(dialogOf()).not.toHaveAttribute('aria-describedby')
  })

  it('header (C19)', () => {
    const { unmount } = renderDrawer({ description: 'Membro desde 2020' })
    const description = screen.getByText('Membro desde 2020')

    expect(headerOf()).toHaveClass(
      'flex',
      'items-center',
      'gap-3',
      'px-6',
      'pt-6',
      'pb-3',
      'border-b',
      'border-default'
    )
    expect(headingOf().tagName).toBe('H2')
    expect(headingOf()).toHaveClass('text-size-75', 'font-semibold')
    expect(description).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-secondary'
    )
    unmount()

    renderDrawer({ divider: false })
    expect(headerOf()).not.toHaveClass('border-b')
    expect(headerOf()).not.toHaveClass('border-default')
  })

  it('header buttons (C20)', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()
    const onClose = jest.fn()
    const { unmount } = renderDrawer({
      headerActions: (
        <IconButton aria-label="Editar" size="small" variant="transparent">
          <Icon name="edit" />
        </IconButton>
      ),
      onBack,
      onClose
    })
    const back = buttonOf('Voltar')
    const close = buttonOf('Fechar')
    const children = Array.from(headerOf().children)

    expect(children).toEqual([
      back,
      headingOf().parentElement,
      buttonOf('Editar'),
      close
    ])
    ;[back, close].forEach(button =>
      expect(button).toHaveClass('bg-transparent', 'text-primary', 'size-8')
    )
    expect(back).toHaveTextContent('arrow_back')
    expect(close).toHaveTextContent('close')

    await user.click(back)
    await user.click(close)
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const labelled = renderDrawer({ closeLabel: 'Fechar detalhes', onClose })
    expect(buttonOf('Fechar detalhes')).toBeInTheDocument()
    labelled.unmount()

    renderDrawer()
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBe(null)
    expect(screen.queryByRole('button', { name: 'Fechar' })).toBe(null)
  })

  it('scrollable body (C21)', () => {
    renderDrawer({ children: <p>Dados do registro</p> })
    const body = bodyOf()

    expect(body).toHaveAttribute('tabindex', '0')
    expect(body).toContainElement(screen.getByText('Dados do registro'))
    expect(body).toHaveClass(
      'flex-1',
      'overflow-auto',
      'p-6',
      'flex',
      'flex-col',
      'gap-4',
      'min-h-30'
    )
  })

  it('footer (C22)', () => {
    const { unmount } = renderDrawer({
      footer: <Button>Salvar</Button>
    })
    const footer = buttonOf('Salvar').parentElement

    expect(footer).toHaveClass(
      'flex',
      'items-center',
      'p-6',
      'gap-2.5',
      'border-t',
      'border-default'
    )
    unmount()

    renderDrawer({ divider: false, footer: <Button>Salvar</Button> })
    expect(buttonOf('Salvar').parentElement).not.toHaveClass('border-t')

    renderDrawer({ title: 'Sem rodapé' })
    const bare = screen.getByRole('dialog', { name: 'Sem rodapé' })
    expect(bare.lastElementChild).toHaveAttribute('aria-label', 'Conteúdo')
  })

  it('modal focus and esc (C23)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { unmount } = renderDrawer({
      children: <input aria-label="Nome" />,
      onBack: jest.fn(),
      onClose
    })
    await waitFor(() => expect(buttonOf('Voltar')).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    renderDrawer({ children: <input aria-label="Nome" /> })
    await waitFor(() => expect(bodyOf()).toHaveFocus())
  })

  it('open defaults to true (C24)', () => {
    const { container, unmount } = renderDrawer({ open: false })
    expect(container).toBeEmptyDOMElement()
    unmount()

    renderDrawer()
    expect(dialogOf()).toBeInTheDocument()
  })

  it('inline drawer (C25)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    document.body.style.overflow = 'scroll'
    const { container } = render(
      <>
        <button type="button">Antes</button>
        <Drawer mode="inline" onClose={onClose} title={TITLE}>
          <button type="button">Ação</button>
        </Drawer>
      </>
    )
    const region = screen.getByRole('region', { name: TITLE })
    const before = buttonOf('Antes')

    expect(screen.queryByRole('dialog')).toBe(null)
    expect(container.querySelector('.bg-scrim')).toBe(null)
    expect(region).not.toHaveAttribute('aria-modal')
    expect(region).not.toHaveClass('fixed')
    expect(region).toHaveClass('w-drawer', 'max-w-full')
    expect(document.body.style.overflow).toBe('scroll')

    before.focus()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(before).toHaveFocus()

    buttonOf('Ação').focus()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()

    buttonOf('Fechar').focus()
    await user.tab()
    expect(bodyOf()).toHaveFocus()
    await user.tab()
    expect(buttonOf('Ação')).toHaveFocus()
    await user.tab()
    expect(document.activeElement).toBe(document.body)
  })

  it('C14a the modal panel slides in from the right; inline does not', () => {
    const { unmount } = renderDrawer({ onClose: jest.fn() })
    expect(dialogOf()).toHaveClass('motion-safe:animate-drawer-in')
    unmount()

    renderDrawer({ mode: 'inline' })
    expect(screen.getByRole('region', { name: TITLE })).not.toHaveClass(
      'motion-safe:animate-drawer-in'
    )
  })
})
