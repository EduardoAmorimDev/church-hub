'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'
import { FilterChip } from '@church/ui/molecules/FilterChip'
import { BottomSheet } from '@church/ui/organisms/BottomSheet'
import { Drawer } from '@church/ui/organisms/Drawer'
import { resolveViewport, Viewport } from '@church/ui/utils'
import {
  CHIP_LIST_DENSITY,
  CHIPS_ROW_DENSITY,
  COUNT_DENSITY,
  SEARCH_DENSITY
} from './data'
import { ActiveFilter, FilterBarProps } from './FilterBar.types'

const filterBar = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-3',
    top: 'flex flex-wrap items-center gap-x-3 gap-y-2',
    search: ['shrink grow', SEARCH_DENSITY],
    count: [
      'm-0 text-size-50 font-medium whitespace-nowrap text-secondary',
      COUNT_DENSITY
    ],
    pill: [
      'ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1',
      'bg-action-primary text-size-25 font-semibold text-inverse'
    ],
    chips: ['flex items-center gap-2', CHIPS_ROW_DENSITY],
    list: ['m-0 flex list-none gap-2', CHIP_LIST_DENSITY],
    item: 'snap-start'
  }
})

export const FilterBar = ({
  className,
  filters = [],
  filtersLabel = 'Filtros',
  onApply,
  onChange,
  onClear,
  panel,
  panelTitle = 'Filtros',
  resultCount,
  resultLabel,
  search
}: FilterBarProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // invariant: null while closed; the viewport is read only when it opens
  // and kept until it closes (lamb-fields-lists Decided 1).
  const [openAs, setOpenAs] = useState<Viewport | null>(null)
  const wasOpen = useRef(false)
  const count = filters.length
  const slots = filterBar()

  // why: runs after the overlay's own focus restore, so the Filtros button
  // gets the focus back even when a chip body opened the panel.
  useEffect(() => {
    if (openAs) {
      wasOpen.current = true
      return
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    buttonRef.current?.focus()
  }, [openAs])

  const open = () => setOpenAs(resolveViewport(rootRef.current))
  const close = () => setOpenAs(null)
  const remove = (filter: ActiveFilter) =>
    onChange?.(filters.filter(item => item.id !== filter.id))

  const footer = (
    <>
      <Button
        color="neutral"
        onClick={() => onClear?.()}
        size="medium"
        variant="ghost"
      >
        Limpar
      </Button>
      <Button
        color="neutral"
        onClick={() => {
          close()
          onApply?.()
        }}
        size="medium"
        variant="filled"
      >
        Ver resultados
      </Button>
    </>
  )

  return (
    <div className={slots.root({ className })} ref={rootRef}>
      <div className={slots.top()}>
        {search != null && search !== false && (
          <div className={slots.search()}>{search}</div>
        )}
        {panel != null && panel !== false && (
          <Button
            aria-expanded={openAs !== null}
            aria-haspopup="dialog"
            aria-label={
              count > 0 ? `${filtersLabel}, ${count} ativos` : filtersLabel
            }
            color="neutral"
            onClick={open}
            ref={buttonRef}
            size="small"
            startIcon={<Icon name="tune" />}
            variant="ghost"
          >
            {filtersLabel}
            {count > 0 && (
              <span aria-hidden="true" className={slots.pill()}>
                {count}
              </span>
            )}
          </Button>
        )}
        {resultCount != null && (
          <p aria-live="polite" className={slots.count()} role="status">
            {resultLabel
              ? resultLabel(resultCount)
              : `${resultCount} resultados`}
          </p>
        )}
      </div>
      {count > 0 && (
        <div className={slots.chips()}>
          <ul aria-label="Filtros ativos" className={slots.list()}>
            {filters.map(filter => (
              <li className={slots.item()} key={filter.id}>
                <FilterChip
                  iconName={filter.iconName}
                  label={filter.label}
                  onClick={panel ? open : undefined}
                  onRemove={() => remove(filter)}
                  value={filter.value}
                />
              </li>
            ))}
          </ul>
          {count >= 2 && (
            <Button
              color="neutral"
              onClick={() => onClear?.()}
              size="small"
              variant="transparent"
            >
              Limpar tudo
            </Button>
          )}
        </div>
      )}
      {panel != null &&
        panel !== false &&
        (openAs === 'mobile' ? (
          <BottomSheet
            detents="half"
            footer={footer}
            onClose={close}
            open
            title={panelTitle}
          >
            {panel}
          </BottomSheet>
        ) : openAs === 'desktop' ? (
          <Drawer
            footer={footer}
            mode="modal"
            onClose={close}
            open
            title={panelTitle}
          >
            {panel}
          </Drawer>
        ) : null)}
    </div>
  )
}
