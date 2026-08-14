// invariant: Lamb's 44px touch target applies in App density only. The base
// classes are App; `panel:` (960px) and an ancestor `[data-viewport]` switch
// to Painel, the Stack `auto` pattern. Literal so Tailwind sees every class.
export const RADIO_TOUCH_ROW =
  'min-h-11 py-2.5 panel:not-in-data-[viewport=mobile]:min-h-0 panel:not-in-data-[viewport=mobile]:py-0 in-data-[viewport=desktop]:min-h-0 in-data-[viewport=desktop]:py-0'

export const RADIO_TOUCH_ROW_LARGE = 'py-1.5'
