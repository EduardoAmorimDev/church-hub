// invariant: Lamb's 44px row applies in App density only; the track keeps
// its own 44px touch area everywhere. Base = App, `panel:` and an ancestor
// `[data-viewport]` switch to Painel (Stack `auto` pattern).
export const TOGGLE_TOUCH_ROW =
  'min-h-11 panel:not-in-data-[viewport=mobile]:min-h-0 in-data-[viewport=desktop]:min-h-0'
