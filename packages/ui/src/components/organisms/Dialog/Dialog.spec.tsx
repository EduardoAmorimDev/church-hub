import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@church/ui/atoms/Button'
import { MenuDropdown } from '@church/ui/molecules/MenuDropdown'
import { Drawer } from '@church/ui/organisms/Drawer'
import { Dialog, DialogColor, DialogProps } from '.'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics; computed px live in styles.spec.ts.
const TITLE = 'Inativar Pessoa Exemplo?'

const renderDialog = (props: Partial<DialogProps> = {}) =>
  render(<Dialog open title={TITLE} {...props} />)

const dialogOf = () => screen.getByRole('dialog', { name: TITLE })
const rootOf = () => {
  const root = dialogOf().parentElement
  if (!root) throw new Error('the dialog has no root')
  return root
}
const overlayOf = () => {
  const overlay = rootOf().firstElementChild
  if (!(overlay instanceof HTMLElement)) throw new Error('no overlay')
  return overlay
}
const headerOf = () => {
  const header = screen.getByRole('heading', { name: TITLE }).parentElement
  if (!header) throw new Error('no header')
  return header
}
const buttonOf = (name: string) => screen.getByRole('button', { name })

const PANEL = 'panel:not-in-data-[viewport=mobile]:'
const DESKTOP = 'in-data-[viewport=desktop]:'
const panel = (...classes: string[]) =>
  classes.flatMap(name => [`${PANEL}${name}`, `${DESKTOP}${name}`])

const actions = {
  primaryAction: { label: 'Inativar membro', onClick: jest.fn() },
  secondaryAction: { label: 'Cancelar', onClick: jest.fn() }
}

describe('Dialog', () => {
  it('esc reaches only the top layer (C5)', async () => {
    const user = userEvent.setup()
    const onDrawerClose = jest.fn()
    const onDialogClose = jest.fn()
    const nested = (dialogOpen: boolean) => (
      <Drawer onClose={onDrawerClose} title="Pessoa Exemplo">
        <Dialog onClose={onDialogClose} open={dialogOpen} title={TITLE} />
      </Drawer>
    )
    const { rerender, unmount } = render(nested(false))
    const drawer = screen.getByRole('dialog', { name: 'Pessoa Exemplo' })
    await waitFor(() =>
      expect(drawer.contains(document.activeElement)).toBe(true)
    )

    rerender(nested(true))
    await waitFor(() => expect(dialogOf()).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(onDialogClose).toHaveBeenCalledTimes(1)
    expect(onDrawerClose).not.toHaveBeenCalled()
    unmount()

    const siblings = (dialogOpen: boolean) => (
      <>
        <Drawer onClose={onDrawerClose} title="Pessoa Exemplo" />
        <Dialog onClose={onDialogClose} open={dialogOpen} title={TITLE} />
      </>
    )
    const second = render(siblings(false))
    second.rerender(siblings(true))
    await waitFor(() => expect(dialogOf()).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(onDialogClose).toHaveBeenCalledTimes(2)
    expect(onDrawerClose).not.toHaveBeenCalled()
  })

  it('esc inside an open menu closes only the menu (C6)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    renderDialog({
      children: (
        <MenuDropdown
          items={[{ label: 'Editar' }, { label: 'Duplicar' }]}
          label="Ações do registro"
          trigger={<Button>Mais opções</Button>}
        />
      ),
      onClose
    })
    await waitFor(() => expect(dialogOf()).toHaveFocus())

    await user.click(buttonOf('Mais opções'))
    expect(
      screen.getByRole('menu', { name: 'Ações do registro' })
    ).toBeInTheDocument()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(buttonOf('Mais opções')).toHaveFocus()
    expect(onClose).not.toHaveBeenCalled()
    expect(dialogOf()).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('modal markup (C7)', () => {
    const { container, rerender } = render(
      <Dialog open={false} title={TITLE} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<Dialog open title={TITLE} />)
    const dialog = dialogOf()
    const heading = screen.getByRole('heading', { name: TITLE })

    expect(rootOf()).toHaveClass(
      'fixed',
      'inset-0',
      'z-50',
      'grid',
      'place-items-center',
      'p-4'
    )
    expect(overlayOf()).toHaveAttribute('aria-hidden', 'true')
    expect(overlayOf()).toHaveClass('absolute', 'inset-0', 'bg-scrim')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id)
    expect(dialog).toHaveAttribute('tabindex', '-1')
    expect(dialog).toHaveClass(
      'w-full',
      'max-h-dialog',
      'bg-surface',
      'text-primary',
      'rounded-2xl',
      'shadow-elevation-deep-high-bottom',
      'overflow-hidden'
    )
  })

  it('sizes (C8)', () => {
    const MAX_WIDTH_PX: ReadonlyArray<[DialogProps['size'], number]> = [
      ['small', 400],
      ['medium', 560],
      [undefined, 560],
      ['large', 720]
    ]
    MAX_WIDTH_PX.forEach(([size, px]) => {
      const { unmount } = renderDialog({ size })
      const others = [400, 560, 720].filter(value => value !== px)

      expect(dialogOf()).toHaveClass(`max-w-${px / 4}`)
      others.forEach(value =>
        expect(dialogOf()).not.toHaveClass(`max-w-${value / 4}`)
      )
      unmount()
    })
  })

  it('header (C9)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { unmount } = renderDialog({ onClose })
    const heading = screen.getByRole('heading', { name: TITLE })
    const close = buttonOf('Fechar')

    expect(headerOf()).toHaveClass(
      'flex',
      'items-center',
      'gap-3',
      'pb-2',
      ...panel('px-6', 'pt-6')
    )
    expect(heading.tagName).toBe('H2')
    expect(heading).toHaveClass('flex-1', 'text-size-200', 'font-semibold')
    expect(close).toHaveClass(
      'bg-transparent',
      'text-primary',
      'size-8',
      'self-start'
    )
    expect(close).toHaveTextContent('close')
    expect(headerOf().lastElementChild).toBe(close)

    await user.click(close)
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const second = renderDialog({ closeLabel: 'Fechar aviso', onClose })
    expect(buttonOf('Fechar aviso')).toBeInTheDocument()
    second.unmount()

    renderDialog()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('status icon (C10)', () => {
    const TABLE: ReadonlyArray<[DialogColor, string, string, string]> = [
      ['neutral', 'info', 'bg-hover', 'text-primary'],
      ['destructive', 'report', 'bg-danger-subtle', 'text-danger'],
      ['positive', 'check_circle', 'bg-positive-subtle', 'text-positive'],
      ['attention', 'warning', 'bg-attention-subtle', 'text-attention']
    ]
    TABLE.forEach(([color, glyph, background, text]) => {
      const { unmount } = renderDialog({ color })
      const circle = headerOf().firstElementChild
      const icon = circle?.firstElementChild

      if (!(circle instanceof HTMLElement) || !(icon instanceof HTMLElement))
        throw new Error(`no icon for ${color}`)
      expect(circle.tagName).toBe('SPAN')
      expect(circle).toHaveAttribute('aria-hidden', 'true')
      expect(circle).toHaveClass('size-8', 'rounded-full', background, text)
      expect(icon).toHaveTextContent(glyph)
      expect(icon).toHaveClass('text-icon-20!')
      expect(icon.style.fontVariationSettings).toContain("'FILL' 1")
      unmount()
    })

    renderDialog()
    expect(headerOf().firstElementChild?.tagName).toBe('H2')
  })

  it('body and description (C11)', () => {
    const { unmount } = renderDialog({
      children: <p>Conteúdo do corpo</p>,
      description: 'Ela sai das listas de presença.'
    })
    const description = screen.getByText('Ela sai das listas de presença.')
    const body = description.parentElement

    expect(body).toHaveClass(
      'flex',
      'flex-col',
      'gap-4',
      'overflow-y-auto',
      'overscroll-contain',
      'pt-2',
      ...panel('px-6', 'pb-6')
    )
    expect(body?.firstElementChild).toBe(description)
    expect(body).toContainElement(screen.getByText('Conteúdo do corpo'))
    expect(description).toHaveClass(
      'text-size-75',
      'font-normal',
      'text-secondary'
    )
    expect(dialogOf()).toHaveAttribute('aria-describedby', description.id)
    expect(dialogOf()).toHaveAccessibleDescription(
      'Ela sai das listas de presença.'
    )
    unmount()

    renderDialog()
    expect(dialogOf()).not.toHaveAttribute('aria-describedby')
  })

  it('built footer (C12)', async () => {
    const user = userEvent.setup()
    const PRIMARY_BG: ReadonlyArray<[DialogColor | undefined, string]> = [
      [undefined, 'bg-neutral-999'],
      ['neutral', 'bg-neutral-999'],
      ['attention', 'bg-neutral-999'],
      ['destructive', 'bg-danger-solid'],
      ['positive', 'bg-positive-solid']
    ]
    PRIMARY_BG.forEach(([color, background]) => {
      const { unmount } = renderDialog({ color, ...actions })
      const primary = buttonOf('Inativar membro')

      expect(primary).toHaveClass(background, 'h-12')
      unmount()
    })

    const onPrimary = jest.fn()
    const onSecondary = jest.fn()
    const { unmount } = renderDialog({
      primaryAction: { iconName: 'send', label: 'Enviar', onClick: onPrimary },
      secondaryAction: { label: 'Cancelar', onClick: onSecondary }
    })
    const primary = buttonOf('Enviar')
    const secondary = buttonOf('Cancelar')
    const footer = primary.parentElement

    expect(footer).toHaveClass(
      'flex',
      'justify-end',
      'gap-2',
      ...panel('pt-4', 'px-6', 'pb-6', 'flex-row')
    )
    expect(Array.from(footer?.children ?? [])).toEqual([secondary, primary])
    expect(secondary).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'h-12')
    expect(primary).toHaveClass('bg-neutral-999', 'text-neutral-00', 'h-12')
    expect(primary.firstElementChild).toHaveTextContent('send')

    await user.click(secondary)
    await user.click(primary)
    expect(onSecondary).toHaveBeenCalledTimes(1)
    expect(onPrimary).toHaveBeenCalledTimes(1)
    unmount()

    const disabledSecondary = renderDialog({
      primaryAction: { label: 'Enviar' },
      secondaryAction: { disabled: true, label: 'Cancelar' }
    })
    expect(buttonOf('Cancelar')).toBeDisabled()
    expect(buttonOf('Enviar')).toBeEnabled()
    disabledSecondary.unmount()

    renderDialog({
      primaryAction: { disabled: true, label: 'Enviar' },
      secondaryAction: { label: 'Cancelar' }
    })
    expect(buttonOf('Enviar')).toBeDisabled()
    expect(buttonOf('Cancelar')).toBeEnabled()
  })

  it('custom footer (C13)', () => {
    renderDialog({
      ...actions,
      footer: <Button>Entendi</Button>
    })
    const custom = buttonOf('Entendi')

    expect(custom.parentElement).toHaveClass('flex', 'justify-end', 'gap-2')
    expect(screen.queryByRole('button', { name: 'Inativar membro' })).toBe(null)
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBe(null)
  })

  it('initial focus order (C14)', async () => {
    const autofocus = renderDialog({
      ...actions,
      children: <input aria-label="Nome" />,
      color: 'destructive',
      footer: <Button data-autofocus="">Voltar</Button>
    })
    await waitFor(() => expect(buttonOf('Voltar')).toHaveFocus())
    autofocus.unmount()

    const field = renderDialog({
      ...actions,
      children: (
        <>
          <input aria-label="Código" disabled />
          <input aria-label="Telefone" />
        </>
      ),
      color: 'destructive'
    })
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Telefone' })).toHaveFocus()
    )
    field.unmount()

    const destructive = renderDialog({ ...actions, color: 'destructive' })
    await waitFor(() => expect(buttonOf('Cancelar')).toHaveFocus())
    destructive.unmount()

    const primary = renderDialog({ ...actions, color: 'attention' })
    await waitFor(() => expect(buttonOf('Inativar membro')).toHaveFocus())
    primary.unmount()

    renderDialog({ onClose: jest.fn() })
    await waitFor(() => expect(dialogOf()).toHaveFocus())
  })

  it('dismissal (C15)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { rerender } = renderDialog({ onClose })
    await waitFor(() => expect(dialogOf()).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(overlayOf())
    expect(onClose).toHaveBeenCalledTimes(2)

    rerender(
      <Dialog dismissible={false} onClose={onClose} open title={TITLE} />
    )
    await user.click(overlayOf())
    expect(onClose).toHaveBeenCalledTimes(2)

    dialogOf().focus()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('loading locks the dialog (C16)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { rerender } = renderDialog({
      loading: true,
      onClose,
      primaryAction: { iconName: 'send', label: 'Enviar' },
      secondaryAction: { label: 'Cancelar' }
    })
    const primary = buttonOf('Enviar')
    const footer = primary.parentElement
    await waitFor(() => expect(dialogOf()).toHaveFocus())

    expect(dialogOf()).toHaveAttribute('aria-busy', 'true')
    expect(footer).toHaveAttribute('inert')
    expect(footer).toHaveClass('opacity-80')
    expect(primary.querySelector('[data-spinner]')).not.toBe(null)
    expect(primary).not.toHaveTextContent('send')
    expect(buttonOf('Fechar')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Processando…')
    expect(screen.getByRole('status')).toHaveClass('sr-only')

    await user.keyboard('{Escape}')
    fireEvent.click(overlayOf())
    fireEvent.click(buttonOf('Fechar'))
    expect(onClose).not.toHaveBeenCalled()

    rerender(
      <Dialog
        onClose={onClose}
        open
        primaryAction={{ iconName: 'send', label: 'Enviar' }}
        secondaryAction={{ label: 'Cancelar' }}
        title={TITLE}
      />
    )
    expect(dialogOf()).not.toHaveAttribute('aria-busy')
    expect(buttonOf('Enviar').parentElement).not.toHaveAttribute('inert')
    expect(buttonOf('Enviar').parentElement).not.toHaveClass('opacity-80')
    expect(screen.queryByRole('status')).toBe(null)
    expect(buttonOf('Fechar')).toBeEnabled()
  })

  it('density classes (C17)', () => {
    render(
      <div data-viewport="mobile">
        <Dialog
          {...actions}
          description="Ela sai das listas de presença."
          open
          title={TITLE}
        />
      </div>
    )
    const primary = buttonOf('Inativar membro')
    const footer = primary.parentElement
    const body = screen.getByText(
      'Ela sai das listas de presença.'
    ).parentElement

    expect(headerOf()).toHaveClass(
      'px-5',
      'pt-5',
      'pb-2',
      ...panel('px-6', 'pt-6')
    )
    expect(body).toHaveClass('px-5', 'pt-2', 'pb-5', ...panel('px-6', 'pb-6'))
    expect(footer).toHaveClass(
      'flex-col',
      'items-stretch',
      '*:w-full',
      'px-5',
      'pt-3',
      'pb-5',
      ...panel('flex-row', 'items-center', '*:w-auto', 'px-6', 'pt-4', 'pb-6')
    )
    expect(footer?.lastElementChild).toBe(primary)
    // invariant: still a centred dialog in App; it never turns into a sheet.
    expect(rootOf()).toHaveClass('grid', 'place-items-center')
    expect(dialogOf()).toHaveClass('rounded-2xl')
  })
})
