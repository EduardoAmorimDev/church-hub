'use client'

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  blockReason,
  DAY_SIZE,
  fromISO,
  longLabel,
  monthWeeks,
  MONTHS,
  sameDay,
  startOfToday,
  toISO,
  WEEK
} from './data'
import type { DatePickerProps, DatePickerShortcut } from './DatePicker.types'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { Tooltip } from '@church/ui/atoms/Tooltip'
import { fieldControl } from '@church/ui/utils'
import { tv } from '@church/ui/lib/tailwind-variants'

const datePicker = tv({
  slots: {
    root: 'flex w-full max-w-84 flex-col gap-2',
    head: 'flex items-center justify-between gap-1',
    caption: 'flex gap-1',
    selectBox: [fieldControl(), 'relative flex h-8 items-center rounded-lg'],
    select: [
      'h-full cursor-pointer appearance-none rounded-lg bg-transparent pr-8 pl-2',
      'font-sans text-size-50 text-primary outline-none'
    ],
    selectIcon: 'pointer-events-none absolute right-2 text-secondary',
    grid: 'w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-0.5',
    weekday: 'py-1 text-center text-size-25 font-medium text-secondary',
    shortcuts: 'flex gap-2 border-t border-default pt-2'
  }
})

// invariant: a range paints its cells as one strip; the ends round outward.
const dayCell = tv({
  base: 'p-0 text-center',
  variants: {
    inRange: { true: 'bg-selected', false: '' },
    start: { true: 'rounded-l-full', false: '' },
    end: { true: 'rounded-r-full', false: '' }
  }
})

const dayButton = tv({
  base: [
    'relative mx-auto inline-flex items-center justify-center rounded-full border-0 bg-transparent',
    'text-size-50 font-normal tabular-nums text-primary transition-colors',
    DAY_SIZE
  ],
  variants: {
    blocked: {
      true: 'cursor-not-allowed text-disabled line-through',
      false: 'cursor-pointer hover:bg-hover active:bg-selected'
    },
    today: {
      true: [
        'font-semibold inset-ring inset-ring-neutral-999',
        'after:absolute after:bottom-1.25 after:left-1/2 after:-ml-0.5 after:size-1 after:rounded-full after:bg-current'
      ],
      false: ''
    },
    selected: {
      true: 'bg-action-primary font-semibold text-inverse hover:bg-neutral-100',
      false: ''
    }
  },
  defaultVariants: { blocked: false, selected: false, today: false }
})

const SHORTCUT_LABEL: Record<DatePickerShortcut, string> = {
  today: 'Hoje',
  yesterday: 'Ontem'
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    disabledDates,
    initialMonth,
    label = 'Calendário',
    max: maxISO,
    min: minISO,
    mode,
    onCancel,
    onChange,
    shortcuts = [],
    value,
    yearRange,
    ...divProps
  } = props
  const captionId = useId()
  const gridRef = useRef<HTMLTableElement>(null)
  const moved = useRef(false)
  const slots = datePicker()

  const today = startOfToday()
  const min = fromISO(minISO)
  const max = fromISO(maxISO)
  const selected = mode === 'range' ? null : fromISO(value)
  const rangeStart = mode === 'range' ? fromISO(value?.start) : null
  const rangeEnd = mode === 'range' ? fromISO(value?.end) : null

  const [focus, setFocus] = useState<Date>(() => {
    const initial = selected ?? rangeStart ?? fromISO(initialMonth)
    if (initial) return initial
    if (max && today > max) return max
    if (min && today < min) return min
    return today
  })
  const [hover, setHover] = useState<Date | null>(null)

  // why: DOM focus follows the focused day only after a grid key or a day
  // click; month buttons and selects keep their own focus.
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  }, [focus])

  const isBlocked = (date: Date) => blockReason(date, min, max, disabledDates)

  const pick = (date: Date) => {
    if (isBlocked(date)) return
    if (mode !== 'range') {
      onChange?.(toISO(date))
      return
    }
    if (!rangeStart || rangeEnd) {
      onChange?.({ start: toISO(date), end: null })
      return
    }
    const [low, high] =
      date < rangeStart ? [date, rangeStart] : [rangeStart, date]
    onChange?.({ start: toISO(low), end: toISO(high) })
  }

  const moveFocus = (date: Date) => {
    moved.current = true
    setFocus(date)
  }

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const { key, shiftKey } = event
    const target =
      key === 'ArrowLeft'
        ? addDays(focus, -1)
        : key === 'ArrowRight'
          ? addDays(focus, 1)
          : key === 'ArrowUp'
            ? addDays(focus, -7)
            : key === 'ArrowDown'
              ? addDays(focus, 7)
              : key === 'Home'
                ? addDays(focus, -focus.getDay())
                : key === 'End'
                  ? addDays(focus, 6 - focus.getDay())
                  : key === 'PageUp'
                    ? addMonths(focus, shiftKey ? -12 : -1)
                    : key === 'PageDown'
                      ? addMonths(focus, shiftKey ? 12 : 1)
                      : null

    if (target) {
      event.preventDefault()
      moveFocus(target)
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      pick(focus)
    } else if (key === 'Escape' && onCancel) {
      event.preventDefault()
      onCancel()
    }
  }

  const previewEnd = rangeEnd ?? (rangeStart && hover ? hover : null)
  const [low, high] =
    rangeStart && previewEnd
      ? previewEnd < rangeStart
        ? [previewEnd, rangeStart]
        : [rangeStart, previewEnd]
      : [rangeStart, rangeStart]

  const firstOfMonth = new Date(focus.getFullYear(), focus.getMonth(), 1)
  const prevDisabled = Boolean(min && addDays(firstOfMonth, -1) < min)
  const nextDisabled = Boolean(
    max && new Date(focus.getFullYear(), focus.getMonth() + 1, 1) > max
  )

  const firstYear =
    yearRange?.[0] ?? min?.getFullYear() ?? today.getFullYear() - 100
  const lastYear =
    yearRange?.[1] ?? max?.getFullYear() ?? today.getFullYear() + 5
  const years = Array.from(
    { length: Math.max(lastYear - firstYear + 1, 0) },
    (_, index) => lastYear - index
  )

  const shortcutDates: Record<DatePickerShortcut, Date> = {
    today,
    yesterday: addDays(today, -1)
  }

  return (
    <div
      {...divProps}
      aria-label={label}
      className={slots.root({ className })}
      role="group"
    >
      <div className={slots.head()}>
        <IconButton
          aria-label="Mês anterior"
          color="neutral"
          disabled={prevDisabled}
          onClick={() => setFocus(addMonths(focus, -1))}
          size="small"
          variant="transparent"
        >
          <Icon name="chevron_left" />
        </IconButton>
        <div className={slots.caption()}>
          <span className={slots.selectBox()}>
            <select
              aria-label="Mês"
              className={slots.select()}
              onChange={event =>
                setFocus(
                  new Date(focus.getFullYear(), Number(event.target.value), 1)
                )
              }
              value={focus.getMonth()}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {capitalize(month)}
                </option>
              ))}
            </select>
            <Icon className={slots.selectIcon()} name="expand_more" />
          </span>
          <span className={slots.selectBox()}>
            <select
              aria-label="Ano"
              className={slots.select()}
              onChange={event =>
                setFocus(
                  new Date(Number(event.target.value), focus.getMonth(), 1)
                )
              }
              value={focus.getFullYear()}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Icon className={slots.selectIcon()} name="expand_more" />
          </span>
        </div>
        <IconButton
          aria-label="Próximo mês"
          color="neutral"
          disabled={nextDisabled}
          onClick={() => setFocus(addMonths(focus, 1))}
          size="small"
          variant="transparent"
        >
          <Icon name="chevron_right" />
        </IconButton>
      </div>
      <span aria-live="polite" className="sr-only" id={captionId}>
        {`${MONTHS[focus.getMonth()]} de ${focus.getFullYear()}`}
      </span>
      <table
        aria-labelledby={captionId}
        className={slots.grid()}
        onKeyDown={onGridKeyDown}
        onMouseLeave={() => setHover(null)}
        ref={gridRef}
        role="grid"
      >
        <thead>
          <tr>
            {WEEK.map(([short, full]) => (
              <th
                abbr={full}
                className={slots.weekday()}
                key={short}
                scope="col"
              >
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(focus).map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, dayIndex) => {
                if (!date)
                  return (
                    <td aria-hidden="true" key={dayIndex} role="gridcell" />
                  )
                const reason = isBlocked(date)
                const isToday = sameDay(date, today)
                const isSelected =
                  mode === 'range'
                    ? sameDay(date, rangeStart) || sameDay(date, rangeEnd)
                    : sameDay(date, selected)
                const inRange = Boolean(
                  mode === 'range' && low && high && date >= low && date <= high
                )
                const name = `${longLabel(date)}${isToday ? ', hoje' : ''}${
                  reason ? `, indisponível: ${reason}` : ''
                }`

                return (
                  <td
                    aria-selected={isSelected || inRange}
                    className={dayCell({
                      end: inRange && sameDay(date, high),
                      inRange,
                      start: inRange && sameDay(date, low)
                    })}
                    data-in-range={inRange || undefined}
                    key={dayIndex}
                    role="gridcell"
                  >
                    <Tooltip content={reason || undefined}>
                      <button
                        aria-disabled={reason ? 'true' : undefined}
                        aria-label={name}
                        className={dayButton({
                          blocked: Boolean(reason),
                          selected: isSelected,
                          today: isToday
                        })}
                        data-today={isToday || undefined}
                        onClick={() => {
                          moveFocus(date)
                          pick(date)
                        }}
                        onMouseEnter={() => {
                          if (mode === 'range') setHover(date)
                        }}
                        tabIndex={sameDay(date, focus) ? 0 : -1}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                    </Tooltip>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {mode !== 'range' && shortcuts.length > 0 && (
        <div className={slots.shortcuts()}>
          {shortcuts.map(shortcut => {
            const date = shortcutDates[shortcut]
            return (
              <Button
                color="neutral"
                disabled={Boolean(isBlocked(date))}
                key={shortcut}
                onClick={() => {
                  setFocus(date)
                  pick(date)
                }}
                size="small"
                variant="ghost"
              >
                {SHORTCUT_LABEL[shortcut]}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
