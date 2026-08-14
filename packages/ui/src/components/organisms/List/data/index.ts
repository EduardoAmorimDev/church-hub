// invariant: `motion-safe:` only, so under `prefers-reduced-motion: reduce`
// the skeleton stays still. Literal so Tailwind sees it.
export const SKELETON_PULSE = 'motion-safe:animate-skeleton-pulse'

// why: the skeleton row keeps the ListItem's height for the List's density,
// so the list does not jump when the items arrive.
export const SKELETON_ROW_HEIGHT = {
  compact: 'min-h-12',
  default: 'min-h-16',
  comfortable: 'min-h-18'
} as const
