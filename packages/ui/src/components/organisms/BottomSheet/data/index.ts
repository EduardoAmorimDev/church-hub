// invariant: `motion-safe:` only, so under `prefers-reduced-motion: reduce`
// neither the scrim nor the panel animates. Literal so Tailwind sees them.
export const SHEET_FADE = 'motion-safe:animate-sheet-fade'
export const SHEET_SLIDE = 'motion-safe:animate-sheet-in'

export const DISMISS_MIN_PX = 96
export const DISMISS_RATIO = 0.25
export const FLICK_MIN_PX = 40
export const FLICK_MAX_MS = 250

export type SheetDrag = {
  /** invariant: downward distance in px, never negative. */
  distance: number
  elapsedMs: number
  /** invariant: the panel's rendered height in px. */
  height: number
}

// why: Lamb closes past 25% of the panel (at least 96px) or on a quick flick
// (> 40px in < 250ms); any other release springs back.
export const shouldDismissSheet = ({
  distance,
  elapsedMs,
  height
}: SheetDrag) =>
  distance > Math.max(DISMISS_MIN_PX, height * DISMISS_RATIO) ||
  (distance > FLICK_MIN_PX && elapsedMs < FLICK_MAX_MS)
