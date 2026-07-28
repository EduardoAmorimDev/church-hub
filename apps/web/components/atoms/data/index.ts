import { AccentColorEnum, IntentionColorEnum, Size, Variants } from '~/models'

export const accentColors = Object.values(AccentColorEnum)
export const intentionColors = Object.values(IntentionColorEnum)
export const sizes: Extract<Size, 'small' | 'medium' | 'large'>[] = [
  'small',
  'medium',
  'large'
]

export const variants: Variants[] = ['filled', 'ghost', 'transparent']
