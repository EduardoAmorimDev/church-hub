import { formatBR, fromISO, toISO } from '@church/ui/molecules/DatePicker'
import type { ISODate } from '@church/ui/molecules/DatePicker'

export const FORMAT_HINT = 'Formato dd/mm/aaaa.'
export const INCOMPLETE_DATE = 'Data incompleta. Use dd/mm/aaaa.'
export const NONEXISTENT_DATE = 'Essa data não existe. Confira dia e mês.'

/** invariant: only digits count, at most 8; the slashes come by themselves
 * ("1503" → "15/03", "15032026" → "15/03/2026"). */
export const maskBR = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 4)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

// why: `setFullYear` keeps years below 100 from shifting to 19xx, and the
// ISO round trip rejects years the `YYYY-MM-DD` value cannot hold.
export const parseBR = (text: string): { date: Date } | { error: string } => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return { error: INCOMPLETE_DATE }
  const [day = 0, month = 0, year = 0] = match.slice(1).map(Number)
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, month - 1, day)
  const exists =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    fromISO(toISO(date)) !== null
  return exists ? { date } : { error: NONEXISTENT_DATE }
}

export const formatISO = (iso: ISODate | null | undefined) => {
  const date = fromISO(iso)
  return date ? formatBR(date) : ''
}
