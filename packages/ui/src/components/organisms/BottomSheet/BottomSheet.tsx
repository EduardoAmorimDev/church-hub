'use client'

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { PointerEvent, useEffect, useId, useRef } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { tv } from '@church/ui/lib/tailwind-variants'
import { FORM_FIELD, useModalLayer } from '@church/ui/utils'
import { BottomSheetProps } from './BottomSheet.types'
import { SHEET_FADE, SHEET_SLIDE, shouldDismissSheet } from './data'

const bottomSheet = tv({
  slots: {
    root: 'fixed inset-0 z-55',
    overlay: ['absolute inset-0 bg-scrim', SHEET_FADE],
    panel: [
      'absolute inset-x-0 bottom-0 mx-auto flex max-h-sheet w-full max-w-150 flex-col',
      'rounded-t-2xl bg-surface text-primary shadow-elevation-low-above focus-visible:outline-none',
      SHEET_SLIDE
    ],
    grab: 'cursor-grab touch-none pt-2',
    handle: 'mx-auto mb-1 block h-1 w-9 rounded-full bg-neutral-33',
    header: 'flex items-center gap-3 pt-1 pr-3 pb-2 pl-5',
    title: 'm-0 min-w-0 flex-1 text-size-75 font-semibold',
    body: [
      'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain',
      'px-5 pt-2 pb-4'
    ],
    footer: [
      'flex flex-col gap-2 border-t border-default bg-surface px-5 py-3',
      '*:w-full'
    ],
    safe: ''
  },
  variants: {
    detents: {
      auto: {},
      half: { panel: 'h-1/2' },
      full: { panel: 'h-sheet' }
    },
    safeArea: {
      env: { safe: 'h-safe-area' },
      mock: {
        safe: [
          'flex h-8.5 items-center justify-center',
          'before:block before:h-1.25 before:w-33.5 before:rounded-full before:bg-neutral-999'
        ]
      },
      none: {}
    }
  },
  defaultVariants: { detents: 'auto', safeArea: 'env' }
})

type DragStart = { startY: number; startTime: number; distance: number }

export const BottomSheet = ({
  children,
  className,
  closeLabel = 'Fechar',
  detents = 'auto',
  dismissible = true,
  footer,
  onClose,
  open,
  safeArea = 'env',
  title
}: BottomSheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragStart | null>(null)
  const titleId = useId()
  // invariant: drag offset and keyboard inset are the only inline geometry,
  // written by `motion` (lamb-overlays Decided, row 3).
  const y = useMotionValue(0)
  const bottom = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  const layer = useModalLayer(open, {
    ref: panelRef,
    onEscape: () => onClose?.(),
    initialFocus: panel =>
      panel.querySelector<HTMLElement>('[data-autofocus]') ??
      bodyRef.current?.querySelector<HTMLElement>(FORM_FIELD)
  })

  // why: the virtual keyboard shrinks the visual viewport, not the layout
  // one; lifting the panel by the difference keeps the footer visible.
  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () =>
      bottom.set(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      )
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    update()
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [bottom, open])

  if (!open) return null

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('button'))
      return
    dragRef.current = {
      distance: 0,
      startTime: Date.now(),
      startY: event.clientY
    }
    if (typeof event.currentTarget.setPointerCapture === 'function')
      event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    drag.distance = Math.max(0, event.clientY - drag.startY)
    y.set(drag.distance)
  }

  const onPointerUp = () => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    const dismiss = shouldDismissSheet({
      distance: drag.distance,
      elapsedMs: Date.now() - drag.startTime,
      height: panelRef.current?.offsetHeight ?? 0
    })
    if (dismiss) {
      y.set(0)
      onClose?.()
      return
    }
    animate(y, 0, { duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' })
  }

  const slots = bottomSheet({ detents, safeArea })

  return (
    <div className={slots.root()}>
      <div
        aria-hidden="true"
        className={slots.overlay()}
        onClick={dismissible ? onClose : undefined}
      />
      <motion.div
        aria-labelledby={titleId}
        aria-modal="true"
        className={slots.panel({ className })}
        onKeyDown={layer.onKeyDown}
        ref={panelRef}
        role="dialog"
        style={{ bottom, y }}
        tabIndex={-1}
      >
        <div
          className={slots.grab()}
          data-sheet-grab=""
          onPointerCancel={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <span aria-hidden="true" className={slots.handle()} />
          <div className={slots.header()}>
            <h2 className={slots.title()} id={titleId}>
              {title}
            </h2>
            <IconButton
              aria-label={closeLabel}
              color="neutral"
              onClick={onClose}
              size="medium"
              variant="ghost"
            >
              <Icon name="close" />
            </IconButton>
          </div>
        </div>
        <div className={slots.body()} ref={bodyRef}>
          {children}
        </div>
        {footer && <div className={slots.footer()}>{footer}</div>}
        {safeArea !== 'none' && (
          <div aria-hidden="true" className={slots.safe()} />
        )}
      </motion.div>
    </div>
  )
}
