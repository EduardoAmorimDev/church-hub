import type { NavItemProps } from '@church/ui/atoms/NavItem'
import {
  UNDER_CONSTRUCTION_SECTIONS,
  buildPeopleTabs,
  buildNavigation
} from './navigation'

type Flat = {
  label: string
  iconName?: string
  href?: unknown
  activated: boolean
  selected: boolean
}

function flatten(items: NavItemProps[]): Flat[] {
  return items.flatMap(item => [
    {
      label: item.label,
      iconName: item.iconName,
      href: item.href,
      activated: Boolean(item.activated),
      selected: Boolean(item.selected)
    },
    ...(item.subItems ?? []).map(sub => ({
      label: sub.label,
      href: sub.href,
      activated: Boolean(sub.activated),
      selected: false
    }))
  ])
}

function all(pathname: string, tab: string | null = null) {
  const nav = buildNavigation(pathname, tab)
  return flatten([...nav.items, ...nav.footerItems])
}

const activated = (pathname: string, tab: string | null = null) =>
  all(pathname, tab)
    .filter(item => item.activated)
    .map(item => item.label)

const peopleSelected = (pathname: string, tab: string | null = null) =>
  all(pathname, tab).find(item => item.label === 'Pessoas')?.selected

describe('buildNavigation — C17: the tree, its icons and destinations', () => {
  it('lists the items in the prototype order', () => {
    const { items, footerItems } = buildNavigation('/home', null)

    expect(
      items.map(({ label, iconName, href }) => ({ label, iconName, href }))
    ).toEqual([
      { label: 'Início', iconName: 'home', href: '/home' },
      { label: 'Pessoas', iconName: 'group', href: undefined },
      { label: 'Ensino', iconName: 'auto_stories', href: '/teaching' },
      { label: 'Gestão', iconName: 'bar_chart', href: '/management' }
    ])
    expect(
      items[1]?.subItems?.map(({ label, href }) => ({ label, href }))
    ).toEqual([
      { label: 'Membros', href: '/people' },
      { label: 'Visitantes', href: '/people?tab=visitors' },
      { label: 'GCs', href: '/people?tab=groups' },
      { label: 'Ministérios', href: '/people?tab=ministries' }
    ])
    expect(
      footerItems.map(({ label, iconName, href }) => ({
        label,
        iconName,
        href
      }))
    ).toEqual([
      { label: 'Configurações', iconName: 'settings', href: '/settings' }
    ])
  })
})

describe('buildNavigation — C18: Membros is current on the members list', () => {
  it.each([
    ['/people', null],
    ['/people', 'members'],
    ['/people', 'unknown'],
    ['/people/id-fake-001', null],
    ['/people/id-fake-001', 'visitors']
  ])('%s ?tab=%s', (pathname, tab) => {
    expect(activated(pathname, tab)).toEqual(['Membros'])
    expect(peopleSelected(pathname, tab)).toBe(true)
  })
})

describe('buildNavigation — C19: each tab marks its sub-item', () => {
  it.each([
    ['visitors', 'Visitantes'],
    ['groups', 'GCs'],
    ['ministries', 'Ministérios']
  ])('/people?tab=%s → %s', (tab, label) => {
    expect(activated('/people', tab)).toEqual([label])
    expect(peopleSelected('/people', tab)).toBe(true)
  })
})

describe('buildNavigation — C20: the under-construction areas', () => {
  it.each([
    ['/home', 'Início'],
    ['/teaching', 'Ensino'],
    ['/management', 'Gestão'],
    ['/settings', 'Configurações']
  ])('%s → %s', (pathname, label) => {
    expect(activated(pathname)).toEqual([label])
    expect(peopleSelected(pathname)).toBe(false)
  })

  it('every leaf outside Pessoas is one of the [section] areas', () => {
    const leaves = all('/home')
      .map(item => item.href)
      .filter(
        (href): href is string =>
          typeof href === 'string' && !href.startsWith('/people')
      )

    expect(leaves).toEqual(
      UNDER_CONSTRUCTION_SECTIONS.map(section => `/${section}`)
    )
  })

  it('a path outside the tree marks nothing', () => {
    expect(activated('/qualquer-coisa')).toEqual([])
    expect(peopleSelected('/people-fake')).toBe(false)
  })
})

describe('buildPeopleTabs — C2/C3: the header tabs of /people', () => {
  it('C2 lists the four tabs in order with their destinations', () => {
    expect(
      buildPeopleTabs(undefined).map(({ label, href }) => ({ label, href }))
    ).toEqual([
      { label: 'Membros', href: '/people' },
      { label: 'Visitantes', href: '/people?tab=visitors' },
      { label: 'Grupos de Crescimento', href: '/people?tab=groups' },
      { label: 'Ministérios', href: '/people?tab=ministries' }
    ])
  })

  it.each([
    [undefined, 'Membros'],
    ['members', 'Membros'],
    ['visitors', 'Visitantes'],
    ['groups', 'Grupos de Crescimento'],
    ['ministries', 'Ministérios'],
    ['xyz', 'Membros'],
    [['visitors', 'groups'], 'Membros']
  ])('C3 tab=%p marks only %p as current', (tab, label) => {
    expect(
      buildPeopleTabs(tab)
        .filter(tab => tab.current)
        .map(tab => tab.label)
    ).toEqual([label])
  })
})

describe('C6: menu destinations and the current sub-item in en-US', () => {
  it('C6 every destination is an en-US path', () => {
    const hrefs = all('/home').map(item => item.href)

    expect(hrefs).toEqual([
      '/home',
      undefined,
      '/people',
      '/people?tab=visitors',
      '/people?tab=groups',
      '/people?tab=ministries',
      '/teaching',
      '/management',
      '/settings'
    ])
  })

  it.each([
    ['/people', null],
    ['/people', 'members'],
    ['/people', 'xyz'],
    ['/people/id-fake-001', 'visitors']
  ])('C6 %s with tab=%s marks Membros', (pathname, tab) => {
    expect(activated(pathname, tab)).toEqual(['Membros'])
  })

  it.each([
    ['visitors', 'Visitantes'],
    ['groups', 'GCs'],
    ['ministries', 'Ministérios']
  ])('C6 /people?tab=%s marks %s', (tab, label) => {
    expect(activated('/people', tab)).toEqual([label])
  })

  it.each(['visitantes', 'gcs', 'ministerios'])(
    'C6 the old pt-BR value tab=%s falls back to Membros',
    tab => {
      expect(activated('/people', tab)).toEqual(['Membros'])
    }
  )
})
