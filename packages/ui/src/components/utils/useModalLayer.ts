'use client'

import { KeyboardEvent, RefObject, useEffect, useRef } from 'react'

export const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

// invariant: an enabled form field, the second choice for first focus in the
// Dialog and the BottomSheet body (after `[data-autofocus]`).
export const FORM_FIELD =
  'input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[role="combobox"]:not([aria-disabled="true"])'

// invariant: one counter for every open layer, so closing a Dialog over a
// Drawer keeps the page locked until the last layer closes.
let lockCount = 0
let savedOverflow = ''

const lockScroll = () => {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

const unlockScroll = () => {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = savedOverflow
}

// why: `offsetParent` (the artifact's test) is always null without layout,
// so visibility is read from `hidden` and the computed display/visibility.
const isHidden = (node: HTMLElement, panel: HTMLElement) => {
  for (
    let current: HTMLElement | null = node;
    current && current !== panel;
    current = current.parentElement
  ) {
    if (current.hidden) return true
    const style = getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden') return true
  }
  return false
}

export const focusableIn = (panel: HTMLElement) =>
  Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    node => !node.closest('[inert]') && !isHidden(node, panel)
  )

export type ModalLayerOptions<T extends HTMLElement> = {
  ref: RefObject<T | null>
  onEscape?: (event: KeyboardEvent<T>) => void
  /** why: overrides the default first focus (`[data-autofocus]`, else the
   * panel); a nullish return falls back to that default. */
  initialFocus?: (panel: T) => HTMLElement | null | undefined
}

/** invariant: spread the returned `onKeyDown` on the panel. React's bubbling
 * follows the DOM (no portal), so a nested layer or an open menu that stops
 * the Esc keeps it from the layers below (lamb-overlays Landing). */
export const useModalLayer = <T extends HTMLElement>(
  open: boolean,
  { initialFocus, onEscape, ref }: ModalLayerOptions<T>
) => {
  const initialFocusRef = useRef(initialFocus)

  useEffect(() => {
    initialFocusRef.current = initialFocus
  })

  useEffect(() => {
    const panel = ref.current
    if (!open || !panel) return
    const previous = document.activeElement
    lockScroll()
    // why: deferred one tick so the panel's children (and any autofocus
    // target a consumer renders) exist and can take focus.
    const timer = setTimeout(() => {
      const target =
        initialFocusRef.current?.(panel) ??
        panel.querySelector<HTMLElement>('[data-autofocus]') ??
        panel
      target.focus()
    }, 0)

    return () => {
      clearTimeout(timer)
      unlockScroll()
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus()
    }
  }, [open, ref])

  const onKeyDown = (event: KeyboardEvent<T>) => {
    const panel = ref.current
    if (!open || !panel) return
    if (event.key === 'Escape') {
      event.stopPropagation()
      onEscape?.(event)
      return
    }
    if (event.key !== 'Tab') return
    event.stopPropagation()
    const focusable = focusableIn(panel)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      panel.focus()
      return
    }
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return { onKeyDown }
}
