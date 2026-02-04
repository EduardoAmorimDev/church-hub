export const colors = ['accent', 'negative', 'neutral', 'positive'] as const
export const sizes = ['small', 'medium', 'large'] as const
export const variants = ['primary', 'secondary', 'tertiary'] as const

export const iconSizes: Record<(typeof sizes)[number], number> = {
  small: 16,
  medium: 20,
  large: 24
}
