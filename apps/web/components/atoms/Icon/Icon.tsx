import { MaterialSymbol } from 'material-symbols'
import { twJoin } from 'tailwind-merge'

export type IconProps = React.ComponentProps<'span'> & {
  name: MaterialSymbol
  fill?: 0 | 1
  grade?: -25 | 0 | 200
  variant?: 'outlined' | 'rounded' | 'sharp'
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

export function Icon({
  name,
  className,
  fill = 0,
  grade = 0,
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
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}`,
        fontSize: 'inherit'
      }}
    >
      {name}
    </span>
  )
}
