import { ComponentProps, ReactNode } from 'react'
import { Avatar, AvatarProps } from '@church/ui/atoms/Avatar'
import { tv } from '@church/ui/lib/tailwind-variants'

const avatarContent = tv({
  slots: {
    root: 'flex flex-col gap-4.5 rounded-2xl border border-default bg-surface p-6',
    head: 'flex items-center gap-4',
    title: 'm-0 text-size-200 font-semibold',
    description: 'm-0 text-size-50 leading-5 font-normal text-secondary',
    badges: 'mt-1 flex flex-wrap gap-2',
    meta: 'm-0 grid grid-cols-fill-30 gap-3',
    term: 'text-size-25 font-medium text-secondary',
    detail: 'm-0 mt-0.5 text-size-50 leading-5 font-medium'
  }
})

export type AvatarContentMeta = {
  label: string
  value: ReactNode
}

export type AvatarContentProps = Omit<
  ComponentProps<'section'>,
  'aria-label' | 'children'
> & {
  /** invariant: names the section and the heading; the Avatar is decorative. */
  name: string
  src?: AvatarProps['src']
  description?: ReactNode
  badges?: ReactNode
  meta?: AvatarContentMeta[]
  headingLevel?: 2 | 3 | 4
}

export const AvatarContent = ({
  badges,
  className,
  description,
  headingLevel = 3,
  meta = [],
  name,
  src,
  ...props
}: AvatarContentProps) => {
  const Heading = `h${headingLevel}` as const
  const slots = avatarContent()

  return (
    <section {...props} aria-label={name} className={slots.root({ className })}>
      <div className={slots.head()}>
        <Avatar alt={name} decorative size="large" src={src ?? ''} />
        <div>
          <Heading className={slots.title()}>{name}</Heading>
          {description != null && description !== false && (
            <p className={slots.description()}>{description}</p>
          )}
          {badges != null && badges !== false && (
            <div className={slots.badges()}>{badges}</div>
          )}
        </div>
      </div>
      {meta.length > 0 && (
        <dl className={slots.meta()}>
          {meta.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <dt className={slots.term()}>{item.label}</dt>
              <dd className={slots.detail()}>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
