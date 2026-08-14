import { colors } from './colors'

// why: Lamb's subtle/hover layers are the primitive `*_alpha` hue at a fixed
// opacity; the 8-digit hex keeps them a plain colour in both themes.
const alpha10 = '1A'
const alpha20 = '33'
const alpha60 = '99'

// invariant: the two Lamb surfaces are literals in tokens.json, not primitives.
const surfaces = {
  light: { page: '#F0F0F2', surface: '#FEFEFE' },
  dark: { page: '#101015', surface: '#27272F' }
} as const

const light = {
  text: {
    primary: colors.grey999,
    secondary: colors.grey83,
    disabled: colors.grey50,
    inverse: colors.grey00,
    link: colors.blue83,
    danger: colors.red83,
    positive: colors.green83,
    attention: colors.yellow100,
    accent: colors.blue67,
    onAccent: colors.grey00,
    onPositive: colors.grey00,
    onDanger: colors.grey00,
    onAttention: colors.grey999
  },
  background: {
    page: surfaces.light.page,
    surface: surfaces.light.surface,
    hover: `${colors.grey_alpha}${alpha10}`,
    selected: `${colors.grey_alpha}${alpha20}`,
    disabled: colors.grey17,
    actionPrimary: colors.grey999,
    accentSolid: colors.blue67,
    positiveSolid: colors.green83,
    dangerSolid: colors.red67,
    attentionSolid: colors.yellow33,
    accentSubtle: `${colors.blue_alpha}${alpha10}`,
    positiveSubtle: `${colors.green_alpha}${alpha10}`,
    dangerSubtle: `${colors.red_alpha}${alpha10}`,
    attentionSubtle: `${colors.yellow_alpha}${alpha10}`,
    scrim: `${colors.grey999}${alpha60}`
  },
  border: {
    default: colors.grey17,
    control: colors.grey67
  },
  focusRing: colors.grey999
}

// invariant: dark must define every semantic name light defines.
type ThemeShape<T> = {
  [K in keyof T]: T[K] extends string ? string : ThemeShape<T[K]>
}

const dark: ThemeShape<typeof light> = {
  text: {
    primary: colors.grey00,
    secondary: colors.grey33,
    disabled: colors.grey67,
    inverse: colors.grey999,
    link: colors.blue33,
    danger: colors.red33,
    positive: colors.green33,
    attention: colors.yellow17,
    accent: colors.blue50,
    onAccent: colors.grey999,
    onPositive: colors.grey999,
    onDanger: colors.grey999,
    onAttention: colors.grey00
  },
  background: {
    ...light.background,
    page: surfaces.dark.page,
    surface: surfaces.dark.surface,
    disabled: colors.grey100,
    actionPrimary: colors.grey00,
    accentSolid: colors.blue50,
    positiveSolid: colors.green33,
    dangerSolid: colors.red50,
    attentionSolid: colors.yellow83
  },
  border: {
    default: colors.grey100,
    control: colors.grey50
  },
  focusRing: colors.grey00
}

export const semantic = { light, dark } as const

export const brand = {
  red: '#EF2F29',
  blue: '#3255AE',
  teal: '#46C0A3'
} as const
