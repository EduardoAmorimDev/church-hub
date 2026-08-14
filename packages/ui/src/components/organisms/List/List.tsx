'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useContext,
  useId
} from 'react'
import { tv } from '@church/ui/lib/tailwind-variants'
import { EmptyState, EmptyStateProps } from '@church/ui/molecules/EmptyState'
import { ListItem, ListItemProps } from '@church/ui/molecules/ListItem'
import { SKELETON_PULSE, SKELETON_ROW_HEIGHT } from './data'
import { ListDensityContext } from './List.context'
import { ListDensity, ListProps, ListSectionProps } from './List.types'

const list = tv({
  slots: {
    root: 'flex flex-col text-primary',
    ul: 'm-0 list-none p-0',
    section: '[[data-list-section]+&]:mt-2',
    heading: 'm-0 px-4 pt-3 pb-1 text-size-25 font-medium text-secondary',
    row: 'flex items-center gap-3 px-4 py-2',
    circle: ['size-8 shrink-0 rounded-full bg-selected', SKELETON_PULSE],
    lines: 'flex min-w-0 flex-1 flex-col gap-0.5',
    line: ['block h-3 rounded-lg bg-selected', SKELETON_PULSE]
  }
})

// why: React's `isValidElement` guard does not narrow the props branch of
// the `empty` union, so this guard states the split.
const isEmptyStateProps = (
  empty: EmptyStateProps | ReactElement
): empty is EmptyStateProps => !isValidElement(empty)

const withDensity = (children: ReactNode, density: ListDensity) =>
  Children.map(children, child =>
    isValidElement<ListItemProps>(child) &&
    child.type === ListItem &&
    child.props.density === undefined
      ? cloneElement(child, { density })
      : child
  )

export const ListSection = ({
  children,
  headingLevel = 3,
  title
}: ListSectionProps) => {
  const headingId = useId()
  const density = useContext(ListDensityContext)
  const Heading = `h${headingLevel}` as const
  const slots = list()

  return (
    <section
      aria-labelledby={headingId}
      className={slots.section()}
      data-list-section=""
    >
      <Heading className={slots.heading()} id={headingId}>
        {title}
      </Heading>
      <ul className={slots.ul()} role="list">
        {withDensity(children, density)}
      </ul>
    </section>
  )
}

export const List = ({
  children,
  className,
  density = 'default',
  empty,
  label,
  loading = false,
  skeletonCount = 3
}: ListProps) => {
  const slots = list()
  const items = Children.toArray(children)
  const hasSections = items.some(
    child => isValidElement(child) && child.type === ListSection
  )

  const body = loading ? (
    <ul aria-busy="true" className={slots.ul()} role="list">
      {Array.from({ length: skeletonCount }, (_, index) => (
        <li aria-hidden="true" key={index}>
          <span
            className={slots.row({ className: SKELETON_ROW_HEIGHT[density] })}
          >
            <span className={slots.circle()} />
            <span className={slots.lines()}>
              <span className={slots.line({ className: 'w-3/5' })} />
              <span className={slots.line({ className: 'w-7/20' })} />
            </span>
          </span>
        </li>
      ))}
      <li className="sr-only" role="status">
        Carregando…
      </li>
    </ul>
  ) : items.length === 0 && empty ? (
    isEmptyStateProps(empty) ? (
      <EmptyState size="small" variant="inline" {...empty} />
    ) : (
      empty
    )
  ) : hasSections ? (
    items
  ) : (
    <ul className={slots.ul()} role="list">
      {withDensity(items, density)}
    </ul>
  )

  return (
    <ListDensityContext.Provider value={density}>
      <div
        aria-label={label}
        className={slots.root({ className })}
        role={label ? 'region' : undefined}
      >
        {body}
      </div>
    </ListDensityContext.Provider>
  )
}
