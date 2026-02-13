import { ColorEnum, SizeEnum, VariantEnum } from '~/models/enums/Components'

export const colors = [
  ColorEnum.ACCENT,
  ColorEnum.NEGATIVE,
  ColorEnum.NEUTRAL,
  ColorEnum.POSITIVE
]
export const sizes = [SizeEnum.SMALL, SizeEnum.MEDIUM, SizeEnum.LARGE]
export const variants = Object.values(VariantEnum)

export const iconSizes: Record<string, number> = {
  [SizeEnum.SMALL]: 16,
  [SizeEnum.MEDIUM]: 20,
  [SizeEnum.LARGE]: 24
}
