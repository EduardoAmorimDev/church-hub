import { breakpoint } from '@church/tokens'

export type Viewport = 'mobile' | 'desktop'

/** invariant: Lamb's App range, one pixel below the `panel` breakpoint. */
export const APP_MEDIA_QUERY = `(max-width: ${breakpoint.panel - 1}px)`

/** invariant: call it only in the handler that opens a popover or sheet,
 * never in render, and keep the result until it closes, so the closed
 * markup never depends on the window (lamb-fields-lists Decided 1). */
export const resolveViewport = (element: Element | null): Viewport => {
  const forced = element?.closest('[data-viewport]')
  if (forced)
    return forced.getAttribute('data-viewport') === 'mobile'
      ? 'mobile'
      : 'desktop'
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return 'desktop'
  return window.matchMedia(APP_MEDIA_QUERY).matches ? 'mobile' : 'desktop'
}
