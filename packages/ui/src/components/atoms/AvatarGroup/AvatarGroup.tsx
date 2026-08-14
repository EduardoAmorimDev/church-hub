import { ComponentProps } from 'react'
import { avatar, Avatar, AvatarProps } from '../Avatar'
import { twMerge } from '@church/ui/lib/tailwind-merge'

type AvatarSize = NonNullable<AvatarProps['size']>

// invariant: Lamb overlaps each avatar on the previous one by a fixed amount
// per size and rings it in the surface colour, so the "+N" circle overlaps too.
const OVERLAP: Record<AvatarSize, string> = {
  xSmall: 'not-first:-ml-2',
  small: 'not-first:-ml-2.5',
  medium: 'not-first:-ml-3.5',
  large: 'not-first:-ml-4',
  xLarge: 'not-first:-ml-6'
}

export type AvatarGroupPerson = {
  name: string
  src?: AvatarProps['src']
}

export type AvatarGroupProps = Omit<
  ComponentProps<'div'>,
  'children' | 'role'
> & {
  people: AvatarGroupPerson[]
  /** invariant: avatars shown before the "+N" circle (default 3). */
  max?: number
  size?: AvatarSize
  /** why: replaces the accessible name, which lists every name by default. */
  label?: string
}

export const AvatarGroup = ({
  className,
  label,
  max = 3,
  people,
  size = 'small',
  ...props
}: AvatarGroupProps) => {
  if (people.length === 0) return null

  const shown = people.slice(0, Math.max(0, max))
  const rest = people.length - shown.length
  const item = twMerge('ring-2 ring-surface', OVERLAP[size])

  return (
    <div
      {...props}
      aria-label={label ?? people.map(person => person.name).join(', ')}
      className={twMerge('inline-flex items-center', className)}
      role="img"
    >
      {shown.map((person, index) => (
        <Avatar
          alt={person.name}
          className={item}
          decorative
          key={`${person.name}-${index}`}
          size={size}
          src={person.src ?? ''}
        />
      ))}
      {rest > 0 && (
        <span
          aria-hidden="true"
          className={avatar({ size }).root({ className: item })}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
