import { twMerge } from '~/lib/tailwind-merge'
import { IconProps } from './models'

export function Icon({
  className,
  fill = 0,
  grade = 0,
  name,
  responsive,
  size = 'medium',
  variant = 'outlined',
  weight = 400
}: IconProps) {
  const iconSizes: Record<string, string> = {
    xSmall: 'text-[12px]!',
    small: responsive ? 'text-[16px]! lg:text-[12px]!' : 'text-[16px]!',
    medium: responsive ? 'text-[20px]! lg:text-[16px]!' : 'text-[20px]!',
    large: responsive ? 'text-[24px]! lg:text-[20px]!' : 'text-[24px]!',
    xLarge: responsive ? 'text-[28px]! lg:text-[24px]!' : 'text-[28px]!'
  }

  return (
    <span
      className={twMerge(
        `material-symbol material-symbols-${variant} ${iconSizes[size]}`,
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}`
      }}
    >
      {name}
    </span>
  )
}
