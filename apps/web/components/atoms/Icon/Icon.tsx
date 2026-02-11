import { IconProps } from './Icon.types'

export function Icon({
  name,
  className,
  fill = 0,
  grade = 0,
  size = 20,
  variant = 'outlined',
  weight = 400
}: IconProps) {
  return (
    <span
      className={`material-symbols-${variant} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        fontSize: size
      }}
    >
      {name}
    </span>
  )
}
