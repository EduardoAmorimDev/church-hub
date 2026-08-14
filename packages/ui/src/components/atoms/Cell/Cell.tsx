'use client'

import { ReactNode } from 'react'
import { Avatar } from '../Avatar'
import { Checkbox } from '../Checkbox'
import { IconButton } from '../IconButton'
import { CellProps } from './Cell.types'
import { getClonedResizedIcons } from '@church/ui/utils'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv } from '@church/ui/lib/tailwind-variants'

export const cell = tv({
  slots: {
    // Heights are fixed (spec.md FR-003) rather than content-driven, so that
    // truncating text can never change a row's height.
    container: 'flex min-w-0 shrink-0 items-center gap-2',
    content: 'flex min-w-0 flex-col gap-0.5',
    // `truncate` keeps the label on one line with an ellipsis (FR-007).
    primary: 'truncate font-medium text-primary text-size-50',
    secondary: 'truncate font-normal text-secondary text-size-25',
    headerLabel: 'truncate font-medium text-secondary text-size-25',
    headerContainer: 'flex h-4 min-w-0 items-center gap-1.5',
    actions: 'flex items-center gap-2'
  },
  variants: {
    heading: {
      true: { container: 'h-10 px-2 py-3' },
      false: { container: 'h-12 p-2' }
    },
    type: {
      check: { container: 'size-8 justify-center p-2' },
      default: {},
      tag: {},
      action: {},
      avatar: {}
    }
  },
  defaultVariants: { heading: false }
})

type CellTextProps = {
  label: string
  paragraph?: string
  slots: ReturnType<typeof cell>
}

const CellText = ({ label, paragraph, slots }: CellTextProps) => (
  <div className={slots.content()}>
    <span className={slots.primary()}>{label}</span>
    {paragraph != null && (
      <span className={slots.secondary()}>{paragraph}</span>
    )}
  </div>
)

export const Cell = (props: CellProps) => {
  const { className, type } = props
  const slots = cell({ heading: props.heading === true, type })

  if (type === 'check') {
    return (
      <div className={twMerge(slots.container(), className)}>
        <Checkbox
          aria-label={props['aria-label']}
          checked={props.checked}
          disabled={props.heading === true ? undefined : props.disabled}
          indeterminate={props.indeterminate}
          onCheckedChange={props.onCheckedChange}
          size="small"
        />
      </div>
    )
  }

  if (type === 'default' && props.heading === true) {
    return (
      <div className={twMerge(slots.container(), className)}>
        <div className={slots.headerContainer()}>
          {props.iconLeft}
          <span className={slots.headerLabel()}>{props.label}</span>
          {props.iconRight}
        </div>
      </div>
    )
  }

  if (type === 'default') {
    const [icon]: ReactNode[] = getClonedResizedIcons({
      icons: [props.icon],
      size: 'medium'
    })

    return (
      <div className={twMerge(slots.container(), className)}>
        {icon}
        <CellText
          label={props.label}
          paragraph={props.paragraph}
          slots={slots}
        />
      </div>
    )
  }

  if (type === 'avatar') {
    return (
      <div className={twMerge(slots.container(), className)}>
        {/* why: the label beside it already names the person, so the Avatar
            is hidden from screen readers; an empty `src` shows initials. */}
        <Avatar
          aria-hidden="true"
          alt={props.label}
          size="small"
          src={props.src ?? ''}
        />
        <CellText
          label={props.label}
          paragraph={props.paragraph}
          slots={slots}
        />
      </div>
    )
  }

  if (type === 'tag') {
    return (
      <div className={twMerge(slots.container(), className)}>
        {props.icon}
        {props.tag}
        {props.action}
      </div>
    )
  }

  return (
    <div className={twMerge(slots.container(), className)}>
      <div className={slots.actions()}>
        {props.actions.map(action => (
          <IconButton
            aria-label={action['aria-label']}
            color="neutral"
            disabled={action.disabled}
            key={action['aria-label']}
            onClick={action.onClick}
            size="small"
            variant="transparent"
          >
            {action.icon}
          </IconButton>
        ))}
      </div>
    </div>
  )
}
