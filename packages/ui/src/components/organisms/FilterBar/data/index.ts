// invariant: base = App (Lamb's `max-width: 959px` block); `panel:` and an
// ancestor `[data-viewport]` switch to Painel (Stack `auto` pattern).
// Literal so the Tailwind scanner sees every class.
export const SEARCH_DENSITY =
  'basis-full max-w-none panel:not-in-data-[viewport=mobile]:basis-60 panel:not-in-data-[viewport=mobile]:max-w-90 in-data-[viewport=desktop]:basis-60 in-data-[viewport=desktop]:max-w-90'

export const COUNT_DENSITY =
  'ml-0 panel:not-in-data-[viewport=mobile]:ml-auto in-data-[viewport=desktop]:ml-auto'

export const CHIPS_ROW_DENSITY =
  'flex-nowrap panel:not-in-data-[viewport=mobile]:flex-wrap in-data-[viewport=desktop]:flex-wrap'

// why: in App the chips scroll sideways; the 8px block padding with the
// matching negative margin keeps the chips' 44px hit areas from clipping.
export const CHIP_LIST_DENSITY =
  'snap-x snap-proximity no-scrollbar flex-nowrap overflow-x-auto -my-2 px-0.5 py-2 panel:not-in-data-[viewport=mobile]:flex-wrap panel:not-in-data-[viewport=mobile]:overflow-x-visible panel:not-in-data-[viewport=mobile]:my-0 panel:not-in-data-[viewport=mobile]:p-0 in-data-[viewport=desktop]:flex-wrap in-data-[viewport=desktop]:overflow-x-visible in-data-[viewport=desktop]:my-0 in-data-[viewport=desktop]:p-0'
