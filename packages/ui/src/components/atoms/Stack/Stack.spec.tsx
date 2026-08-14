import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { Stack, StackProps } from './Stack'

// why: jsdom has no media queries, so these specs assert the gap utility
// each density requests; styles.spec compiles how `auto` resolves in CSS.
const classesOf = (props: StackProps) => {
  const { container } = render(<Stack {...props} />)
  return container.firstElementChild?.className.split(' ') ?? []
}

const gapsOf = (props: StackProps) =>
  classesOf(props).filter(name => name.includes('gap-'))

type Row = [
  StackProps['tier'],
  StackProps['relation'],
  Partial<StackProps>,
  number
]

const PANEL: Row[] = [
  ['primitive', 'strong', {}, 8],
  ['primitive', 'weak', {}, 16],
  ['primitive', 'none', {}, 24],
  ['composite', 'strong', {}, 12],
  ['composite', 'weak', {}, 16],
  ['composite', 'none', {}, 24],
  ['block', 'strong', {}, 16],
  ['block', 'weak', {}, 16],
  ['block', 'weak', { surfaces: false }, 24],
  ['block', 'none', {}, 24]
]

const APP: Row[] = [
  ['primitive', 'strong', {}, 8],
  ['primitive', 'strong', { interactive: true }, 12],
  ['primitive', 'weak', {}, 16],
  ['primitive', 'none', {}, 32],
  ['composite', 'strong', {}, 16],
  ['composite', 'weak', {}, 24],
  ['composite', 'none', {}, 32],
  ['block', 'strong', {}, 24],
  ['block', 'weak', {}, 32],
  ['block', 'none', {}, 32]
]

// invariant: Tailwind's spacing unit is 4px, so `gap-N` is N × 4px.
const gapClass = (px: number) => `gap-${px / 4}`

describe('Stack', () => {
  it('default stack (C49)', () => {
    const { container } = render(<Stack />)
    const element = container.firstElementChild

    expect(element?.tagName).toBe('DIV')
    expect(element).toHaveClass('flex', 'flex-col', 'min-w-0')
    expect(element?.className).not.toMatch(/(^|\s)(bg-|border|p[xytrbl]?-)/)
    expect(element).toHaveClass(
      'panel:not-in-data-[viewport=mobile]:gap-4',
      'in-data-[viewport=desktop]:gap-4'
    )
  })

  it.each(PANEL)(
    'panel gap matrix (C50): %s × %s %j → %ipx',
    (tier, relation, extra, px) => {
      expect(gapsOf({ density: 'panel', relation, tier, ...extra })).toEqual([
        gapClass(px)
      ])
    }
  )

  it.each(APP)(
    'app gap matrix (C51): %s × %s %j → %ipx',
    (tier, relation, extra, px) => {
      expect(gapsOf({ density: 'app', relation, tier, ...extra })).toEqual([
        gapClass(px)
      ])
    }
  )

  it('forced density ignores the viewport (C53)', () => {
    for (const density of ['panel', 'app'] as const) {
      const gaps = gapsOf({ density, relation: 'weak', tier: 'composite' })

      expect(gaps).toHaveLength(1)
      expect(gaps[0]).not.toMatch(/panel:|data-\[viewport/)
    }
  })

  it('server markup is viewport independent (C54)', () => {
    const matchMedia = jest.fn()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
      writable: true
    })
    const tree = (
      <Stack relation="weak" tier="block">
        <span>Dados do GC</span>
      </Stack>
    )

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375
    })
    const narrow = renderToString(tree)
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440
    })
    const wide = renderToString(tree)
    render(tree)

    expect(narrow).toBe(wide)
    expect(matchMedia).not.toHaveBeenCalled()
  })

  it('horizontal stack (C55)', () => {
    expect(classesOf({ direction: 'horizontal' })).toEqual(
      expect.arrayContaining(['flex-row', 'flex-wrap', 'items-center'])
    )

    const noWrap = classesOf({ direction: 'horizontal', wrap: false })
    expect(noWrap).toEqual(expect.arrayContaining(['flex-row', 'flex-nowrap']))
    expect(noWrap).not.toContain('flex-wrap')
  })

  it('polymorphic element (C56)', () => {
    render(
      <Stack aria-labelledby="dados" as="section" data-testid="grupo" id="g1">
        <h3 id="dados">Dados do GC</h3>
      </Stack>
    )
    const section = screen.getByTestId('grupo')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('aria-labelledby', 'dados')
    expect(section).toHaveAttribute('id', 'g1')
    expect(screen.getByRole('region', { name: 'Dados do GC' })).toBe(section)
  })

  it.each([
    [{ align: 'start' }, 'items-start'],
    [{ align: 'center' }, 'items-center'],
    [{ align: 'end' }, 'items-end'],
    [{ align: 'stretch' }, 'items-stretch'],
    [{ align: 'baseline' }, 'items-baseline'],
    [{ justify: 'start' }, 'justify-start'],
    [{ justify: 'center' }, 'justify-center'],
    [{ justify: 'end' }, 'justify-end'],
    [{ justify: 'between' }, 'justify-between'],
    [{ justify: 'around' }, 'justify-around'],
    [{ justify: 'evenly' }, 'justify-evenly']
  ] as const)('alignment literals (C57): %j → %s', (props, expected) => {
    const { container } = render(<Stack direction="horizontal" {...props} />)
    const element = container.firstElementChild

    expect(element).toHaveClass(expected)
    expect(element).not.toHaveAttribute('style')
  })
})
