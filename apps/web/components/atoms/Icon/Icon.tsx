import { MaterialSymbol } from 'material-symbols'

type IconProps = {
  name: MaterialSymbol
  fill?: 0 | 1
  grade?: -25 | 0 | 200
  size?: number
  variant?: 'outlined' | 'rounded' | 'sharp'
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

export function Icon({
  name,
  fill = 0,
  grade = 0,
  size = 20,
  variant = 'outlined',
  weight = 400
}: IconProps) {
  return (
    <span
      className={`material-symbols-${variant}`}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        fontSize: size
      }}
    >
      {name}
    </span>
  )
}
