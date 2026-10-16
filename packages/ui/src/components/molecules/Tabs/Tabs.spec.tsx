import { render, screen, within } from '@testing-library/react'
import { Tabs } from '.'
import meta from './Tabs.stories'

// invariant: synthetic data only (constitution, Principle V).
const ITEMS = [
  { label: 'Membros', href: '/people' },
  { label: 'Visitantes', href: '/people?tab=visitors', current: true },
  { label: 'Grupos de Crescimento', href: '/people?tab=groups' }
]

const linksOf = () =>
  within(screen.getByRole('navigation', { name: 'Seções' })).getAllByRole(
    'link'
  )

describe('Tabs', () => {
  it('C2 renders one link per item, in order, inside a named nav', () => {
    render(<Tabs items={ITEMS} label="Seções" />)

    expect(linksOf().map(link => link.textContent)).toEqual([
      'Membros',
      'Visitantes',
      'Grupos de Crescimento'
    ])
    expect(linksOf().map(link => link.getAttribute('href'))).toEqual([
      '/people',
      '/people?tab=visitors',
      '/people?tab=groups'
    ])
  })

  it('C3 marks only the current tab with aria-current="page"', () => {
    render(<Tabs items={ITEMS} label="Seções" />)
    const [members, visitors, groups] = linksOf()

    expect(visitors).toHaveAttribute('aria-current', 'page')
    expect(members).not.toHaveAttribute('aria-current')
    expect(groups).not.toHaveAttribute('aria-current')
  })

  it('draws the small chip: selected highlighted, the others muted', () => {
    render(<Tabs items={ITEMS} label="Seções" />)
    const [members, visitors] = linksOf()

    expect(visitors).toHaveClass(
      'h-7',
      'text-size-25',
      'border-neutral-999',
      'bg-hover',
      'text-primary'
    )
    expect(members).toHaveClass('h-7', 'border-default', 'text-secondary')
    expect(members).not.toHaveClass('text-primary')
  })

  it('story links its Figma node', () => {
    expect(meta.parameters?.design).toEqual(
      expect.objectContaining({ url: expect.stringContaining('141-4446') })
    )
  })
})
