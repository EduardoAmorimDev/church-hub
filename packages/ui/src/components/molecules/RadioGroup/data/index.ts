// invariant: default options sit 12px apart in Painel and touch in App, where
// each Radio row grows to 44px instead; cards keep 8px in both densities.
// Literal classes, Stack `auto` pattern (base = App).
export const OPTIONS_GAP = {
  default:
    'gap-y-0 panel:not-in-data-[viewport=mobile]:gap-y-3 in-data-[viewport=desktop]:gap-y-3',
  card: 'gap-2'
} as const
