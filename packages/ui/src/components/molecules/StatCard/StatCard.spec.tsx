import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatCard } from './StatCard'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const cardOf = () => screen.getByRole('article', { name: 'Membros ativos' })
const glyphsOf = (element: Element) =>
  Array.from(element.querySelectorAll('.material-symbols-outlined'))

describe('StatCard', () => {
  it('medium card (C55)', () => {
    render(<StatCard label="Membros ativos" value={1284} />)
    const card = cardOf()
    const label = screen.getByText('Membros ativos')
    const value = screen.getByText('1.284')

    expect(card.tagName).toBe('ARTICLE')
    expect(card).toHaveAttribute('aria-labelledby', label.id)
    expect(card).toHaveClass('p-6', 'gap-6', 'rounded-2xl', 'bg-surface')
    expect(card.className).not.toMatch(/(^|\s)shadow-/)
    expect(label.parentElement).toHaveClass(
      'text-size-50',
      'font-normal',
      'text-secondary'
    )
    expect(value.tagName).toBe('P')
    expect(value).toHaveClass(
      'font-oswald',
      'font-bold',
      'text-size-500',
      'uppercase',
      'tabular-nums',
      'text-primary'
    )
  })

  it('icon (C56)', () => {
    render(<StatCard iconName="group" label="Membros ativos" value={1284} />)
    const label = screen.getByText('Membros ativos')
    const [icon] = glyphsOf(cardOf())

    expect(icon).toHaveTextContent('group')
    expect(icon).toHaveClass('text-icon-16!')
    expect(icon?.nextElementSibling).toBe(label)
    expect(label.parentElement).toHaveClass('gap-2')
  })

  it('number formatting (C57)', () => {
    const format: Intl.NumberFormatOptions = {
      currency: 'BRL',
      style: 'currency'
    }
    const expected = new Intl.NumberFormat('pt-BR', format).format(2115)
    const { rerender } = render(
      <StatCard format={format} label="Membros ativos" value={2115} />
    )

    expect(expected.replace(/\s/g, ' ')).toBe('R$ 2.115,00')
    expect(cardOf().querySelector('p')?.textContent).toBe(expected)

    rerender(<StatCard label="Membros ativos" value="—" />)
    expect(screen.getByText('—')).toHaveClass('font-oswald')
  })

  it('trend (C58)', () => {
    render(
      <StatCard label="Membros ativos" trend="+12 este mês" value={1284} />
    )
    const trend = screen.getByText('+12 este mês')

    expect(trend.parentElement).toHaveTextContent('1.284+12 este mês')
    expect(trend.previousSibling?.textContent).toBe('1.284')
    expect(trend).toHaveClass(
      'text-size-25',
      'font-medium',
      'text-positive',
      'ml-2',
      'normal-case',
      'font-sans'
    )
  })

  it('help button (C59)', async () => {
    const user = userEvent.setup()
    render(
      <StatCard
        help="Pessoas com presença nos últimos 90 dias"
        label="Membros ativos"
        value={1284}
      />
    )
    const button = screen.getByRole('button', {
      name: 'Sobre Membros ativos: Pessoas com presença nos últimos 90 dias'
    })
    const tooltip = screen.getByRole('tooltip', { hidden: true })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('size-6', 'rounded-full', 'text-secondary')
    expect(glyphsOf(button)[0]).toHaveTextContent('info')
    expect(glyphsOf(button)[0]).toHaveClass('text-icon-16!')
    expect(tooltip).toHaveTextContent(
      'Pessoas com presença nos últimos 90 dias'
    )
    expect(tooltip).toHaveAttribute('data-open', 'false')

    await user.hover(button)
    expect(tooltip).toHaveAttribute('data-open', 'true')
    await user.unhover(button)
    expect(tooltip).toHaveAttribute('data-open', 'false')

    await user.tab()
    expect(button).toHaveFocus()
    expect(tooltip).toHaveAttribute('data-open', 'true')
  })

  it('sub infos (C60)', () => {
    render(
      <StatCard
        label="Membros ativos"
        subs={[
          { iconName: 'person_add', label: 'novos', value: 1250 },
          { label: 'visitantes', value: 34 }
        ]}
        value={1284}
      />
    )
    const value = screen.getByText('1.250')
    const sub = value.parentElement
    const row = sub?.parentElement

    expect(row).toHaveClass('flex', 'flex-wrap', 'gap-3')
    expect(row?.children).toHaveLength(2)
    expect(sub).toHaveClass('gap-1', 'text-size-25')
    expect(sub?.querySelector('.material-symbols-outlined')).toHaveClass(
      'text-icon-14!'
    )
    expect(value).toHaveClass('font-medium', 'text-primary')
    expect(screen.getByText('novos')).toHaveClass(
      'font-normal',
      'text-secondary'
    )
    const visitors = screen.getByText('34').parentElement
    expect(visitors?.querySelector('.material-symbols-outlined')).toBeNull()
  })

  it('small card (C61)', () => {
    render(<StatCard label="Membros ativos" size="small" value={1284} />)

    expect(cardOf()).toHaveClass('p-3', 'gap-3')
    expect(cardOf()).not.toHaveClass('p-6', 'gap-6')
    expect(screen.getByText('1.284')).toHaveClass(
      'text-size-300',
      'leading-7.5'
    )
  })
})
