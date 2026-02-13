import { IconProps } from './Icon.types'
import { twJoin } from 'tailwind-merge'

export function Icon({
  name,
  className,
  fill = 0,
  grade = 0,
  size,
  variant = 'outlined',
  weight = 400
}: IconProps) {
  return (
    <span
      className={twJoin(
        `material-symbol material-symbols-${variant}`,
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        fontSize: size
      }}
    >
      {name}
    </span>
  )
}
