import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const rootOf = () => screen.getByTestId('empty')
const circleOf = () => rootOf().firstElementChild
const glyphOf = () => rootOf().querySelector('.material-symbols-outlined')
const variationOf = () => {
  const glyph = glyphOf()
  return glyph instanceof HTMLElement ? glyph.style.fontVariationSettings : ''
}

describe('EmptyState', () => {
  it('default empty state (C45)', () => {
    render(<EmptyState data-testid="empty" title="Nenhum relatório ainda" />)
    const heading = screen.getByRole('heading', {
      level: 3,
      name: 'Nenhum relatório ainda'
    })

    expect(rootOf()).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'text-center',
      'gap-4',
      'py-8',
      'px-4'
    )
    expect(rootOf()).not.toHaveAttribute('role')
    expect(circleOf()).toHaveClass(
      'size-20',
      'rounded-full',
      'bg-hover',
      'text-secondary'
    )
    expect(circleOf()).toHaveAttribute('aria-hidden', 'true')
    expect(glyphOf()).toHaveTextContent('inbox')
    expect(glyphOf()).toHaveClass('text-icon-48!')
    expect(variationOf()).toContain("'FILL' 0")
    expect(variationOf()).toContain("'wght' 300")
    expect(heading).toHaveClass('text-size-75', 'font-semibold')
  })

  it('description (C46)', () => {
    render(
      <EmptyState
        description="Os relatórios enviados aparecem aqui."
        title="Nenhum relatório ainda"
      />
    )
    const description = screen.getByText(
      'Os relatórios enviados aparecem aqui.'
    )

    expect(description).toHaveClass(
      'text-size-75',
      'font-normal',
      'text-secondary'
    )
    expect(description.parentElement).toHaveClass('gap-1', 'max-w-105')
    expect(description.previousElementSibling).toHaveTextContent(
      'Nenhum relatório ainda'
    )
  })

  it.each([2, 3, 4, 5, 6] as const)('heading level (C47): %s', level => {
    render(<EmptyState headingLevel={level} title="Sem membros" />)

    expect(
      screen.getByRole('heading', { level, name: 'Sem membros' })
    ).toBeInTheDocument()
  })

  it('success drops actions (C48)', () => {
    render(
      <EmptyState
        actions={<button type="button">Criar relatório</button>}
        data-testid="empty"
        status="success"
        title="Tudo em dia"
      />
    )

    expect(glyphOf()).toHaveTextContent('task_alt')
    expect(variationOf()).toContain("'FILL' 1")
    expect(circleOf()).toHaveClass('bg-positive-subtle', 'text-positive')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(rootOf()).not.toHaveAttribute('role')
  })

  it('error status (C49)', () => {
    render(
      <EmptyState
        data-testid="empty"
        status="error"
        title="Falha ao carregar"
      />
    )

    expect(screen.getByRole('status')).toBe(rootOf())
    expect(glyphOf()).toHaveTextContent('error')
    expect(variationOf()).toContain("'FILL' 1")
    expect(circleOf()).toHaveClass('bg-danger-subtle', 'text-danger')
  })

  it('actions (C50)', () => {
    render(
      <EmptyState
        actions={
          <>
            <button type="button">Criar relatório</button>
            <button type="button">Ver modelos</button>
          </>
        }
        title="Nenhum relatório ainda"
      />
    )
    const actions = screen.getByRole('button', {
      name: 'Criar relatório'
    }).parentElement

    expect(actions).toHaveClass('flex', 'flex-wrap', 'justify-center', 'gap-2')
    expect(actions?.children).toHaveLength(2)
  })

  it('page variant (C51)', () => {
    render(
      <EmptyState data-testid="empty" title="Sem membros" variant="page" />
    )

    expect(rootOf()).toHaveClass('min-h-90', 'justify-center', 'py-12', 'px-6')
    expect(rootOf()).not.toHaveClass('py-8', 'px-4')
  })

  it('small size (C52)', () => {
    render(
      <EmptyState
        data-testid="empty"
        description="Nada por aqui."
        size="small"
        title="Sem membros"
      />
    )

    expect(rootOf()).toHaveClass('gap-3', 'py-6', 'px-4')
    expect(rootOf()).not.toHaveClass('gap-4', 'py-8')
    expect(circleOf()).toHaveClass('size-14')
    expect(glyphOf()).toHaveClass('text-icon-32!')
    expect(glyphOf()).not.toHaveClass('text-icon-48!')
    expect(screen.getByText('Nada por aqui.')).toHaveClass(
      'text-size-50',
      'leading-5'
    )
  })

  it('compact variant (C53)', () => {
    render(
      <EmptyState
        actions={<button type="button">Adicionar</button>}
        data-testid="empty"
        description="Nada por aqui."
        title="Sem membros"
        variant="compact"
      />
    )
    const title = screen.getByRole('heading', { name: 'Sem membros' })

    expect(rootOf()).toHaveClass(
      'flex-row',
      'text-left',
      'items-center',
      'gap-3',
      'py-3',
      'px-4'
    )
    expect(rootOf()).not.toHaveClass('flex-col', 'text-center')
    expect(circleOf()).toHaveClass('size-8')
    expect(glyphOf()).toHaveClass('text-icon-20!')
    expect(title.parentElement).toHaveClass('flex-1', 'gap-0.5', 'max-w-none')
    expect(title).toHaveClass('text-size-50', 'leading-5', 'font-medium')
    expect(screen.getByText('Nada por aqui.')).toHaveClass(
      'text-size-25',
      'font-normal'
    )
    expect(screen.getByRole('button').parentElement).toHaveClass('flex-nowrap')
  })

  it('custom icon and illustration (C54)', () => {
    const { rerender } = render(
      <EmptyState
        data-testid="empty"
        iconName="diversity_3"
        title="Sem grupos"
      />
    )

    expect(glyphOf()).toHaveTextContent('diversity_3')

    rerender(
      <EmptyState
        data-testid="empty"
        illustration={<svg data-testid="art" />}
        title="Sem grupos"
      />
    )
    expect(rootOf().firstElementChild).toBe(screen.getByTestId('art'))
    expect(glyphOf()).toBeNull()
  })
})
