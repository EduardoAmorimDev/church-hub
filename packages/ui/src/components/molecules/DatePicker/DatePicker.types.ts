import { ComponentProps } from 'react'

/** invariant: a local calendar date `YYYY-MM-DD`, with no time or zone. */
export type ISODate = string

export type DateRange = { start: ISODate | null; end: ISODate | null }

export type DatePickerShortcut = 'today' | 'yesterday'

type DatePickerCommon = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange'
> & {
  min?: ISODate
  max?: ISODate
  /** why: `true` or a reason blocks the day; the reason is read in its name
   * and shown in a Tooltip ("Data indisponível" for `true`). */
  disabledDates?: (iso: ISODate) => boolean | string
  /** invariant: shown in `single` mode only. */
  shortcuts?: DatePickerShortcut[]
  yearRange?: [number, number]
  initialMonth?: ISODate
  /** invariant: called on Esc inside the grid; the picker never closes itself. */
  onCancel?: () => void
  /** invariant: names the calendar `role="group"`; defaults to "Calendário". */
  label?: string
}

export type DatePickerSingleProps = DatePickerCommon & {
  mode?: 'single'
  value?: ISODate | null
  onChange?: (value: ISODate) => void
}

export type DatePickerRangeProps = DatePickerCommon & {
  mode: 'range'
  /** invariant: the first click sets `start` (`end` null); the second closes
   * the range, ordered ascending. */
  value?: DateRange | null
  onChange?: (value: DateRange) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps
