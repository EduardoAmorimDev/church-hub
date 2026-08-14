import type { SelectOption } from '../Select.types'

// invariant: Lamb's option is 40px in Painel and the 44px touch target in
// App. Base = App; `panel:` and an ancestor `[data-viewport]` switch to
// Painel (DatePicker `DAY_SIZE` pattern). Literal so Tailwind sees it.
export const OPTION_DENSITY =
  'min-h-11 panel:not-in-data-[viewport=mobile]:min-h-10 in-data-[viewport=desktop]:min-h-10'

export const TYPEAHEAD_RESET_MS = 600

// why: search and typeahead ignore accents and case ("joao" finds "São João").
export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export const matchesQuery = (option: SelectOption, query: string) =>
  normalize(`${option.label} ${option.description ?? ''}`).includes(
    normalize(query)
  )

/** invariant: the first enabled index from `from` walking by `step`, or -1. */
export const enabledIndex = (
  options: SelectOption[],
  from: number,
  step: 1 | -1
) => {
  for (let index = from; index >= 0 && index < options.length; index += step)
    if (!options[index]?.disabled) return index
  return -1
}
