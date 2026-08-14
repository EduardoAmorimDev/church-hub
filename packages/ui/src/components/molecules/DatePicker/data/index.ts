import type { ISODate } from '../DatePicker.types'

// invariant: Lamb's day is 40px in Painel and the 44px touch target in App.
// Base = App; `panel:` and an ancestor `[data-viewport]` switch to Painel
// (Stack `auto` pattern). Literal so Tailwind sees every class.
export const DAY_SIZE =
  'size-11 panel:not-in-data-[viewport=mobile]:size-10 in-data-[viewport=desktop]:size-10'

export const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
] as const

// invariant: Sunday first, as Lamb's grid; [column header, full name].
export const WEEK = [
  ['dom', 'domingo'],
  ['seg', 'segunda-feira'],
  ['ter', 'terça-feira'],
  ['qua', 'quarta-feira'],
  ['qui', 'quinta-feira'],
  ['sex', 'sexta-feira'],
  ['sáb', 'sábado']
] as const

const pad = (value: number) => String(value).padStart(2, '0')

export const toISO = (date: Date): ISODate =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// why: anything other than a real `YYYY-MM-DD` day (e.g. "2026-02-31") is
// treated as no value (task Unresolved 5), never as a shifted date.
export const fromISO = (iso: ISODate | null | undefined): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  if (year === undefined || month === undefined || day === undefined)
    return null
  const date = new Date(year, month - 1, day)
  return toISO(date) === iso ? date : null
}

export const formatBR = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`

export const longLabel = (date: Date) =>
  `${WEEK[date.getDay()]?.[1]}, ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

// invariant: keeps the day of month, clamped to the target month's last day.
export const addMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate()
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), last)
  )
}

export const sameDay = (a: Date | null, b: Date | null) =>
  a !== null && b !== null && toISO(a) === toISO(b)

export const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// why: the reason a day cannot be picked, or false; read in the day's name.
export const blockReason = (
  date: Date,
  min: Date | null,
  max: Date | null,
  disabledDates?: (iso: ISODate) => boolean | string
): string | false => {
  if (min && date < min)
    return `Antes de ${formatBR(min)}, a primeira data permitida`
  if (max && date > max)
    return `Depois de ${formatBR(max)}, a última data permitida`
  const blocked = disabledDates?.(toISO(date))
  if (!blocked) return false
  return typeof blocked === 'string' ? blocked : 'Data indisponível'
}

// invariant: one row per week, Sunday first, `null` for padding cells.
export const monthWeeks = (focus: Date) => {
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1)
  const days = new Date(focus.getFullYear(), focus.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = Array.from(
    { length: first.getDay() },
    () => null
  )
  for (let day = 1; day <= days; day++)
    cells.push(new Date(focus.getFullYear(), focus.getMonth(), day))
  while (cells.length % 7) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
