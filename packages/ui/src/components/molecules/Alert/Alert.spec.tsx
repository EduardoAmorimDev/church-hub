import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from './Alert'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const rootOf = () => screen.getByTestId('alert')
const glyphOf = (element: HTMLElement) =>
  element.querySelector('.material-symbols-outlined')
const fillOf = (glyph: Element | null) =>
  glyph instanceof HTMLElement ? glyph.style.fontVariationSettings : ''

describe('Alert', () => {
  it('success alert (C20)', () => {
    render(<Alert data-testid="alert" title="Relatório enviado" />)
    const icon = rootOf().firstElementChild
    const title = screen.getByText('Relatório enviado')

    expect(rootOf()).toHaveClass(
      'bg-positive-subtle',
      'border',
      'border-green-alpha/40',
      'p-3',
      'gap-3',
      'rounded-10',
      'w-full',
      'max-w-112'
    )
    expect(icon).toHaveTextContent('check_circle')
    expect(icon).toHaveClass('text-icon-20!', 'text-positive')
    expect(fillOf(icon)).toContain("'FILL' 1")
    expect(title).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-semibold',
      'text-positive'
    )
  })

  it.each([
    ['info', 'bg-hover', 'border-default', 'info', 'text-primary'],
    [
      'error',
      'bg-danger-subtle',
      'border-red-alpha/40',
      'report',
      'text-danger'
    ],
    [
      'warning',
      'bg-attention-subtle',
      'border-yellow-alpha/40',
      'warning',
      'text-attention'
    ]
  ] as const)(
    'variants (C21): %s',
    (variant, background, border, iconName, titleColor) => {
      render(<Alert data-testid="alert" title="Aviso" variant={variant} />)
      const icon = rootOf().firstElementChild

      expect(rootOf()).toHaveClass(background, 'border', border)
      expect(icon).toHaveTextContent(iconName)
      expect(icon).toHaveClass(titleColor)
      expect(screen.getByText('Aviso')).toHaveClass(titleColor)
    }
  )

  it.each([
    ['success', 'Sucesso: '],
    ['info', 'Informação: '],
    ['error', 'Erro: '],
    ['warning', 'Atenção: ']
  ] as const)('hidden status word (C22): %s', (variant, word) => {
    render(<Alert title="Relatório enviado" variant={variant} />)
    const prefix = screen.getByText(word.trim())

    expect(prefix).toHaveClass('sr-only')
    expect(prefix.textContent).toBe(word)
    expect(prefix.parentElement).toHaveTextContent(`${word}Relatório enviado`)
    expect(prefix.parentElement?.firstChild).toBe(prefix)
  })

  it('description (C23)', () => {
    render(
      <Alert title="Relatório enviado">O líder da rede foi avisado.</Alert>
    )
    const description = screen.getByText('O líder da rede foi avisado.')

    expect(description).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-primary'
    )
    expect(description.parentElement).toHaveClass('flex-col', 'gap-1')
    expect(description.previousElementSibling).toHaveTextContent(
      'Relatório enviado'
    )
  })

  it('actions (C24)', () => {
    render(
      <Alert
        actions={<button type="button">Ver relatório</button>}
        title="Relatório enviado"
      >
        O líder foi avisado.
      </Alert>
    )
    const actions = screen.getByRole('button', {
      name: 'Ver relatório'
    }).parentElement

    expect(actions).toHaveClass('flex', 'gap-2')
    expect(actions?.parentElement).toHaveClass('flex-col', 'gap-3')
    expect(actions?.previousElementSibling).toHaveTextContent(
      'O líder foi avisado.'
    )
  })

  it('close button (C25)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const { rerender } = render(
      <Alert onClose={onClose} title="Relatório enviado" />
    )
    const close = screen.getByRole('button', { name: 'Fechar aviso' })

    expect(close).toHaveClass('size-8')
    expect(glyphOf(close)).toHaveTextContent('close')
    expect(glyphOf(close)).toHaveClass('text-icon-20!')
    await user.click(close)
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <Alert
        closeLabel="Dispensar"
        onClose={onClose}
        title="Relatório enviado"
      />
    )
    expect(screen.getByRole('button', { name: 'Dispensar' })).toBeVisible()

    rerender(<Alert title="Relatório enviado" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('live region (C26)', () => {
    const { rerender } = render(
      <Alert data-testid="alert" live title="Falhou" variant="error" />
    )
    expect(screen.getByRole('alert')).toBe(rootOf())

    for (const variant of ['success', 'info', 'warning'] as const) {
      rerender(
        <Alert data-testid="alert" live title="Aviso" variant={variant} />
      )
      expect(screen.getByRole('status')).toBe(rootOf())
    }

    rerender(<Alert data-testid="alert" title="Falhou" variant="error" />)
    expect(rootOf()).not.toHaveAttribute('role')
  })

  it('custom icon (C27)', () => {
    render(<Alert data-testid="alert" iconName="campaign" title="Novo culto" />)

    expect(rootOf().firstElementChild).toHaveTextContent('campaign')
    expect(rootOf()).not.toHaveTextContent('check_circle')
  })
})
