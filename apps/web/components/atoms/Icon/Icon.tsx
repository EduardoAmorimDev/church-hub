import { MaterialSymbol } from 'material-symbols'
import { twMerge } from 'tailwind-merge'

export type IconProps = React.ComponentProps<'span'> & {
  fill?: 0 | 1
  grade?: -25 | 0 | 200
  name: MaterialSymbol
  responsive?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'outlined' | 'rounded' | 'sharp'
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

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
    small: responsive ? 'text-[16px]! lg:text-[12px]!' : 'text-[16px]!',
    medium: responsive ? 'text-[20px]! lg:text-[16px]!' : 'text-[20px]!',
    large: responsive ? 'text-[24px]! lg:text-[20px]!' : 'text-[24px]!'
  }

  return (
    <span
      className={twMerge(
        `material-symbol material-symbols-${variant} ${iconSizes[size]}`,
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}`,
        fontSize: 'inherit'
      }}
    >
      {name}
    </span>
  )
}
