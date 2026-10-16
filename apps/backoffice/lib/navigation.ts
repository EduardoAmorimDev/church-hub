import type { NavItemProps } from '@church/ui/atoms/NavItem'
import type { TabItem } from '@church/ui/molecules/Tabs'

export const PEOPLE_TABS = [
  'members',
  'visitors',
  'groups',
  'ministries'
] as const

export type PeopleTab = (typeof PEOPLE_TABS)[number]

export const UNDER_CONSTRUCTION_SECTIONS = [
  'home',
  'teaching',
  'management',
  'settings'
] as const

export type UnderConstructionSection =
  (typeof UNDER_CONSTRUCTION_SECTIONS)[number]

export function isPeopleTab(value: unknown): value is PeopleTab {
  return PEOPLE_TABS.some(tab => tab === value)
}

export function isUnderConstructionSection(
  value: unknown
): value is UnderConstructionSection {
  return UNDER_CONSTRUCTION_SECTIONS.some(section => section === value)
}

// invariant: `tabLabel` is the header tab's text (Figma 141-4446); the
// SideMenu keeps the shorter `label`.
const PEOPLE_SUB_ITEMS: ReadonlyArray<{
  tab: PeopleTab
  label: string
  tabLabel: string
  href: string
}> = [
  { tab: 'members', label: 'Membros', tabLabel: 'Membros', href: '/people' },
  {
    tab: 'visitors',
    label: 'Visitantes',
    tabLabel: 'Visitantes',
    href: '/people?tab=visitors'
  },
  {
    tab: 'groups',
    label: 'GCs',
    tabLabel: 'Grupos de Crescimento',
    href: '/people?tab=groups'
  },
  {
    tab: 'ministries',
    label: 'Ministérios',
    tabLabel: 'Ministérios',
    href: '/people?tab=ministries'
  }
]

/** invariant: a missing, repeated or unknown `tab` is Membros. */
export function currentPeopleTab(tab: unknown): PeopleTab {
  return isPeopleTab(tab) ? tab : 'members'
}

export function buildPeopleTabs(tab: unknown): TabItem[] {
  const current = currentPeopleTab(tab)
  return PEOPLE_SUB_ITEMS.map(item => ({
    label: item.tabLabel,
    href: item.href,
    current: item.tab === current
  }))
}

export type Navigation = {
  items: NavItemProps[]
  footerItems: NavItemProps[]
}

// why: ibfc-server has no menu endpoint, so the tree lives here.
// invariant: on `/people/{id}` and for an unknown `tab`, Membros is current.
export function buildNavigation(
  pathname: string,
  tab: string | null
): Navigation {
  const inPeople = pathname === '/people' || pathname.startsWith('/people/')
  const currentTab: PeopleTab | null = !inPeople
    ? null
    : pathname === '/people' && isPeopleTab(tab)
      ? tab
      : 'members'

  // invariant: a leaf exists only for a listed section, never a 404.
  const leaf = (
    iconName: NavItemProps['iconName'],
    label: string,
    section: UnderConstructionSection
  ): NavItemProps => {
    const href = `/${section}`
    return { iconName, label, href, activated: pathname === href }
  }

  return {
    items: [
      leaf('home', 'Início', 'home'),
      {
        iconName: 'group',
        label: 'Pessoas',
        selected: inPeople,
        subItems: PEOPLE_SUB_ITEMS.map(item => ({
          label: item.label,
          href: item.href,
          activated: item.tab === currentTab
        }))
      },
      leaf('auto_stories', 'Ensino', 'teaching'),
      leaf('bar_chart', 'Gestão', 'management')
    ],
    footerItems: [leaf('settings', 'Configurações', 'settings')]
  }
}
