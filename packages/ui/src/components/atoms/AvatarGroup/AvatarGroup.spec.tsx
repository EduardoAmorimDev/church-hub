import { render, screen } from '@testing-library/react'
import { AvatarGroup, AvatarGroupProps } from './AvatarGroup'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM/accessibility tree, not computed styles.
const PEOPLE: AvatarGroupProps['people'] = [
  { name: 'Pessoa A' },
  { name: 'Pessoa B' },
  { name: 'Pessoa C' },
  { name: 'Pessoa D' },
  { name: 'Pessoa E' }
]

const childrenOf = (group: HTMLElement) => Array.from(group.children)

describe('AvatarGroup', () => {
  it('overflow and group name (C1)', () => {
    render(<AvatarGroup people={PEOPLE} />)
    const group = screen.getByRole('img', {
      name: 'Pessoa A, Pessoa B, Pessoa C, Pessoa D, Pessoa E'
    })
    const items = childrenOf(group)

    expect(items).toHaveLength(4)
    expect(items.slice(0, 3).map(item => item.textContent)).toEqual([
      'PA',
      'PB',
      'PC'
    ])
    items.forEach(item => {
      expect(item).toHaveAttribute('aria-hidden', 'true')
      expect(item).toHaveClass('size-8')
    })
    expect(items[3]).toHaveTextContent(/^\+2$/)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(1)
  })

  it('custom label (C2)', () => {
    render(<AvatarGroup label="12 participantes" people={PEOPLE} />)

    expect(
      screen.getByRole('img', { name: '12 participantes' })
    ).toBeInTheDocument()
  })

  it.each([
    ['xSmall', 'size-6', 'not-first:-ml-2'],
    ['small', 'size-8', 'not-first:-ml-2.5'],
    ['medium', 'size-12', 'not-first:-ml-3.5'],
    ['large', 'size-14', 'not-first:-ml-4'],
    ['xLarge', 'size-20', 'not-first:-ml-6']
  ] as const)('overlap by size (C3): %s', (size, box, overlap) => {
    render(<AvatarGroup people={PEOPLE} size={size} />)
    const items = childrenOf(screen.getByRole('img'))

    expect(items).toHaveLength(4)
    items.forEach(item => {
      expect(item).toHaveClass(box, overlap, 'ring-2', 'ring-surface')
    })
  })

  it('no overflow (C4)', () => {
    const { rerender } = render(<AvatarGroup people={PEOPLE.slice(0, 3)} />)

    expect(childrenOf(screen.getByRole('img'))).toHaveLength(3)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()

    rerender(<AvatarGroup max={5} people={PEOPLE} />)
    expect(childrenOf(screen.getByRole('img'))).toHaveLength(5)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('empty group (C5)', () => {
    const { container } = render(<AvatarGroup people={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
