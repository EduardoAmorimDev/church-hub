import { ComponentProps } from 'react'
import { fullArt, LogoTone, symbolArt } from './data'
import { twMerge } from '@church/ui/lib/tailwind-merge'

// invariant: the ink follows `neutral-999` (white in dark); the three arcs
// keep the brand colours in both themes.
const TONE_CLASS: Record<LogoTone, string> = {
  ink: 'fill-current',
  red: 'fill-brand-red',
  blue: 'fill-brand-blue',
  teal: 'fill-brand-teal'
}

export type LogoProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** `full` = symbol + wordmark (118×40); `symbol` = the arcs alone (40×40). */
  variant?: 'full' | 'symbol'
  label?: string
}

export const Logo = ({
  className,
  label = 'Igreja Batista Filadélfia',
  variant = 'full',
  ...props
}: LogoProps) => {
  const art = variant === 'symbol' ? symbolArt : fullArt

  return (
    <span
      {...props}
      aria-label={label}
      className={twMerge('text-neutral-999 inline-flex h-10', className)}
      role="img"
    >
      <svg
        aria-hidden
        className="block h-full w-auto"
        fill="none"
        focusable="false"
        viewBox={art.viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        {art.paths.map(({ d, tone }, index) => (
          <path className={TONE_CLASS[tone]} d={d} key={index} />
        ))}
      </svg>
    </span>
  )
}
