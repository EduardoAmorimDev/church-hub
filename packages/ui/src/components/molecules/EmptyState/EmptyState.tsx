import { ComponentProps, ReactNode } from 'react'
import { Icon, IconName } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'

// invariant: variant comes after size, so `compact` wins over `small` as in
// Lamb's cascade, while `small` padding wins over `page` (compound below).
const emptyState = tv({
  slots: {
    root: 'flex flex-col items-center gap-4 px-4 py-8 text-center text-primary',
    circle:
      'inline-flex size-20 shrink-0 items-center justify-center rounded-full',
    icon: 'text-icon-48! text-current',
    text: 'flex max-w-105 flex-col gap-1',
    title: 'm-0 text-size-75 font-semibold',
    description: 'm-0 text-size-75 font-normal text-secondary',
    actions: 'flex flex-wrap justify-center gap-2'
  },
  variants: {
    status: {
      neutral: { circle: 'bg-hover text-secondary' },
      success: { circle: 'bg-positive-subtle text-positive' },
      error: { circle: 'bg-danger-subtle text-danger' }
    },
    size: {
      small: {
        root: 'gap-3 px-4 py-6',
        circle: 'size-14',
        icon: 'text-icon-32!',
        description: 'text-size-50 leading-5'
      },
      medium: {}
    },
    variant: {
      page: { root: 'min-h-90 justify-center' },
      inline: {},
      compact: {
        root: 'flex-row items-center gap-3 px-4 py-3 text-left',
        circle: 'size-8',
        icon: 'text-icon-20!',
        text: 'max-w-none flex-1 gap-0.5',
        title: 'text-size-50 leading-5 font-medium',
        description: 'text-size-25 font-normal',
        actions: 'flex-nowrap'
      }
    }
  },
  compoundVariants: [
    { variant: 'page', size: 'medium', class: { root: 'px-6 py-12' } }
  ],
  defaultVariants: { size: 'medium', status: 'neutral', variant: 'inline' }
})

type EmptyStatus = 'neutral' | 'success' | 'error'

const STATUS_ICON: Record<EmptyStatus, IconName> = {
  neutral: 'inbox',
  success: 'task_alt',
  error: 'error'
}

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  iconName?: IconName
  /** invariant: replaces the icon circle. */
  illustration?: ReactNode
  title: ReactNode
  description?: ReactNode
  status?: EmptyStatus
  size?: 'small' | 'medium'
  variant?: 'page' | 'inline' | 'compact'
  /** why: Lamb drops actions on `success`, where nothing is left to do. */
  actions?: ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export const EmptyState = ({
  actions,
  className,
  description,
  headingLevel = 3,
  iconName,
  illustration,
  size = 'medium',
  status = 'neutral',
  title,
  variant = 'inline',
  ...props
}: EmptyStateProps) => {
  const Heading = `h${headingLevel}` as const
  const slots = emptyState({ size, status, variant })
  const showActions =
    actions != null && actions !== false && status !== 'success'

  return (
    <div
      {...props}
      className={slots.root({ className })}
      role={status === 'error' ? 'status' : props.role}
    >
      {illustration ?? (
        <span aria-hidden="true" className={slots.circle()}>
          <Icon
            className={slots.icon()}
            fill={status === 'neutral' ? 0 : 1}
            name={iconName ?? STATUS_ICON[status]}
            weight={300}
          />
        </span>
      )}
      <div className={slots.text()}>
        <Heading className={slots.title()}>{title}</Heading>
        {description != null && description !== false && (
          <p className={slots.description()}>{description}</p>
        )}
      </div>
      {showActions && <div className={slots.actions()}>{actions}</div>}
    </div>
  )
}
