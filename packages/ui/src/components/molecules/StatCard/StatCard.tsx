'use client'

import { ComponentProps, ReactNode, useId } from 'react'
import { formatValue, SubInfo, SubInfoProps } from './components'
import { Icon, IconName } from '@church/ui/atoms/Icon'
import { Tooltip } from '@church/ui/atoms/Tooltip'
import { Typography } from '@church/ui/atoms/Typography'
import { tv } from '@church/ui/lib/tailwind-variants'

const statCard = tv({
  slots: {
    root: 'flex min-w-0 flex-col rounded-2xl bg-surface',
    head: 'flex items-center gap-2 text-size-50 font-normal text-secondary',
    label: 'flex-1',
    help: [
      'inline-flex size-6 shrink-0 items-center justify-center rounded-full p-0',
      'text-secondary transition-colors hover:bg-hover'
    ],
    value: 'm-0 text-primary tabular-nums',
    trend:
      'ml-2 align-middle font-sans text-size-25 font-medium normal-case text-positive',
    subs: 'flex flex-wrap gap-3'
  },
  variants: {
    size: {
      small: { root: 'gap-3 p-3' },
      medium: { root: 'gap-6 p-6' }
    }
  },
  defaultVariants: { size: 'medium' }
})

export type StatCardProps = Omit<
  ComponentProps<'article'>,
  'aria-labelledby' | 'children'
> & {
  label: string
  value: number | string
  /** invariant: applied to a numeric `value` with `Intl.NumberFormat('pt-BR')`. */
  format?: Intl.NumberFormatOptions
  iconName?: IconName
  trend?: ReactNode
  /** why: explains the metric; shown in a Tooltip on an info button. */
  help?: string
  subs?: SubInfoProps[]
  size?: 'small' | 'medium'
}

export const StatCard = ({
  className,
  format,
  help,
  iconName,
  label,
  size = 'medium',
  subs = [],
  trend,
  value,
  ...props
}: StatCardProps) => {
  const labelId = useId()
  const slots = statCard({ size })

  return (
    <article
      {...props}
      aria-labelledby={labelId}
      className={slots.root({ className })}
    >
      <div className={slots.head()}>
        {iconName && (
          <Icon className="text-current" name={iconName} size="small" />
        )}
        <span className={slots.label()} id={labelId}>
          {label}
        </span>
        {help && (
          <Tooltip content={help}>
            <button
              aria-label={`Sobre ${label}: ${help}`}
              className={slots.help()}
              type="button"
            >
              <Icon className="text-current" name="info" size="small" />
            </button>
          </Tooltip>
        )}
      </div>
      <Typography
        as="p"
        className={slots.value()}
        variant={size === 'small' ? 'd3' : 'd1'}
      >
        {formatValue(value, format)}
        {trend != null && trend !== false && (
          <span className={slots.trend()}>{trend}</span>
        )}
      </Typography>
      {subs.length > 0 && (
        <div className={slots.subs()}>
          {subs.map((sub, index) => (
            <SubInfo key={`${sub.label}-${index}`} {...sub} />
          ))}
        </div>
      )}
    </article>
  )
}
