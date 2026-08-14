import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode, useRef } from 'react'
import { BottomSheet } from '@church/ui/organisms/BottomSheet'
import { Dialog } from '@church/ui/organisms/Dialog'
import { Drawer } from '@church/ui/organisms/Drawer'
import { useModalLayer } from '.'

type LayerProps = { open: boolean; children?: ReactNode }

const Layer = ({ children, open }: LayerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const layer = useModalLayer(open, { ref })
  if (!open) return null
  return (
    <div
      aria-label="Camada"
      onKeyDown={layer.onKeyDown}
      ref={ref}
      role="dialog"
      tabIndex={-1}
    >
      {children}
    </div>
  )
}

const layerOf = () => screen.getByRole('dialog', { name: 'Camada' })

const inert = (node: HTMLElement | null) => {
  node?.setAttribute('inert', '')
}

afterEach(() => {
  document.body.style.overflow = ''
})

const OVERLAYS: ReadonlyArray<[string, (open: boolean) => ReactNode]> = [
  ['hook', open => <Layer open={open} />],
  ['Dialog', open => <Dialog open={open} title="Confirmar envio" />],
  ['Drawer modal', open => <Drawer open={open} title="Pessoa Exemplo" />],
  ['BottomSheet', open => <BottomSheet open={open} title="Marcar presença" />]
]

describe('useModalLayer', () => {
  it.each(OVERLAYS)('locks body scroll (C1): %s', (_name, overlay) => {
    document.body.style.overflow = 'scroll'
    const { rerender } = render(<>{overlay(false)}</>)
    expect(document.body.style.overflow).toBe('scroll')

    rerender(<>{overlay(true)}</>)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<>{overlay(false)}</>)
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('locks body scroll (C1): the inline Drawer leaves the page scrollable', () => {
    document.body.style.overflow = 'scroll'
    render(<Drawer mode="inline" title="Pessoa Exemplo" />)

    expect(document.body.style.overflow).toBe('scroll')
  })

  it('scroll lock counts layers (C2)', () => {
    document.body.style.overflow = 'auto'
    const stack = (dialogOpen: boolean, drawerOpen: boolean) => (
      <>
        <Drawer open={drawerOpen} title="Pessoa Exemplo" />
        <Dialog open={dialogOpen} title="Descartar alterações?" />
      </>
    )
    const { rerender } = render(stack(true, true))
    expect(document.body.style.overflow).toBe('hidden')

    rerender(stack(false, true))
    expect(
      screen.queryByRole('dialog', { name: 'Descartar alterações?' })
    ).toBe(null)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(stack(false, false))
    expect(document.body.style.overflow).toBe('auto')
  })

  it('traps focus (C3)', async () => {
    const user = userEvent.setup()
    render(
      <Layer open>
        <div ref={inert}>
          <button type="button">Inerte</button>
        </div>
        <button type="button">Primeiro</button>
        <button type="button">Meio</button>
        <button type="button">Último</button>
        <button hidden type="button">
          Oculto
        </button>
        <div hidden>
          <button type="button">Dentro do oculto</button>
        </div>
      </Layer>
    )
    const first = screen.getByRole('button', { name: 'Primeiro' })
    const last = screen.getByRole('button', { name: 'Último' })
    await waitFor(() => expect(layerOf()).toHaveFocus())

    await user.tab({ shift: true })
    expect(last).toHaveFocus()

    await user.tab()
    expect(first).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Meio' })).toHaveFocus()

    await user.tab({ shift: true })
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
  })

  it('traps focus (C3): a layer with nothing focusable keeps focus on its panel', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Layer open>
          <p>Nenhuma ação disponível.</p>
        </Layer>
        <button type="button">Fora da camada</button>
      </>
    )
    await waitFor(() => expect(layerOf()).toHaveFocus())

    await user.tab()
    expect(layerOf()).toHaveFocus()

    await user.tab({ shift: true })
    expect(layerOf()).toHaveFocus()
  })

  it('restores focus (C4)', async () => {
    const Harness = ({ open }: { open: boolean }) => (
      <>
        <button type="button">Abrir</button>
        <Layer open={open}>
          <button type="button">Dentro</button>
        </Layer>
      </>
    )
    const { rerender } = render(<Harness open={false} />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    trigger.focus()

    rerender(<Harness open />)
    await waitFor(() => expect(layerOf()).toHaveFocus())

    rerender(<Harness open={false} />)
    expect(trigger).toHaveFocus()
  })

  it('restores focus (C4): a trigger no longer in the document is skipped', async () => {
    const Harness = ({
      open,
      trigger
    }: {
      open: boolean
      trigger: boolean
    }) => (
      <>
        {trigger && <button type="button">Abrir</button>}
        <Layer open={open}>
          <button type="button">Dentro</button>
        </Layer>
      </>
    )
    const { rerender } = render(<Harness open={false} trigger />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    trigger.focus()

    rerender(<Harness open trigger />)
    await waitFor(() => expect(layerOf()).toHaveFocus())
    rerender(<Harness open trigger={false} />)

    expect(() =>
      rerender(<Harness open={false} trigger={false} />)
    ).not.toThrow()
    expect(trigger.isConnected).toBe(false)
    expect(document.activeElement).toBe(document.body)
  })
})
