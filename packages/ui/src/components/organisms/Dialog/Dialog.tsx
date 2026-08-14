'use client'

import { useId, useRef } from 'react'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { Spinner } from '@church/ui/atoms/Spinner'
import { tv } from '@church/ui/lib/tailwind-variants'
import { FORM_FIELD, useModalLayer } from '@church/ui/utils'
import {
  DIALOG_BODY_DENSITY,
  DIALOG_FOOTER_DENSITY,
  DIALOG_HEADER_DENSITY,
  DIALOG_ICON,
  PRIMARY_COLOR
} from './data'
import { DialogProps } from './Dialog.types'

const dialog = tv({
  slots: {
    root: 'fixed inset-0 z-50 grid place-items-center p-4',
    overlay: 'absolute inset-0 bg-scrim',
    panel: [
      'relative flex max-h-dialog w-full flex-col overflow-hidden rounded-2xl',
      'bg-surface text-primary shadow-elevation-deep-high-bottom focus-visible:outline-none'
    ],
    header: ['flex items-center gap-3 pb-2', DIALOG_HEADER_DENSITY],
    icon: 'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
    title: 'm-0 min-w-0 flex-1 text-size-200 font-semibold',
    close: '-mt-1 -mr-2 self-start',
    body: [
      'flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pt-2',
      DIALOG_BODY_DENSITY
    ],
    description: 'm-0 text-size-75 font-normal text-secondary',
    footer: ['flex justify-end gap-2', DIALOG_FOOTER_DENSITY]
  },
  variants: {
    size: {
      small: { panel: 'max-w-100' },
      medium: { panel: 'max-w-140' },
      large: { panel: 'max-w-180' }
    },
    color: {
      neutral: { icon: 'bg-hover text-primary' },
      destructive: { icon: 'bg-danger-subtle text-danger' },
      positive: { icon: 'bg-positive-subtle text-positive' },
      attention: { icon: 'bg-attention-subtle text-attention' }
    },
    loading: {
      true: { footer: 'opacity-80' },
      false: {}
    }
  },
  defaultVariants: { loading: false, size: 'medium' }
})

export const Dialog = ({
  children,
  className,
  closeLabel = 'Fechar',
  color,
  description,
  dismissible = true,
  footer,
  loading = false,
  onClose,
  open,
  primaryAction,
  secondaryAction,
  size = 'medium',
  title
}: DialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const close = () => {
    if (!loading) onClose?.()
  }

  const layer = useModalLayer(open, {
    ref: panelRef,
    onEscape: close,
    initialFocus: panel =>
      panel.querySelector<HTMLElement>('[data-autofocus]') ??
      bodyRef.current?.querySelector<HTMLElement>(FORM_FIELD) ??
      (color === 'destructive'
        ? panel.querySelector<HTMLElement>(
            '[data-dialog-secondary]:not(:disabled)'
          )
        : null) ??
      panel.querySelector<HTMLElement>('[data-dialog-primary]:not(:disabled)')
  })

  if (!open) return null

  const slots = dialog({ color, loading, size })
  const builtFooter = (primaryAction || secondaryAction) && (
    <>
      {secondaryAction && (
        <Button
          color="neutral"
          data-dialog-secondary=""
          disabled={loading || secondaryAction.disabled}
          onClick={secondaryAction.onClick}
          size="medium"
          variant="ghost"
        >
          {secondaryAction.label}
        </Button>
      )}
      {primaryAction && (
        <Button
          color={PRIMARY_COLOR[color ?? 'neutral']}
          data-dialog-primary=""
          disabled={loading || primaryAction.disabled}
          onClick={primaryAction.onClick}
          size="medium"
          startIcon={
            loading ? (
              <Spinner className="text-icon-18" />
            ) : primaryAction.iconName ? (
              <Icon name={primaryAction.iconName} />
            ) : undefined
          }
          variant="filled"
        >
          {primaryAction.label}
        </Button>
      )}
    </>
  )
  const footerContent = footer ?? builtFooter

  return (
    <div className={slots.root()}>
      <div
        aria-hidden="true"
        className={slots.overlay()}
        onClick={dismissible ? close : undefined}
      />
      <div
        aria-busy={loading || undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={slots.panel({ className })}
        onKeyDown={layer.onKeyDown}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className={slots.header()}>
          {color && (
            <span aria-hidden="true" className={slots.icon()}>
              <Icon
                className="text-current"
                fill={1}
                name={DIALOG_ICON[color]}
                size="medium"
              />
            </span>
          )}
          <h2 className={slots.title()} id={titleId}>
            {title}
          </h2>
          {onClose && (
            <IconButton
              aria-label={closeLabel}
              className={slots.close()}
              color="neutral"
              disabled={loading}
              onClick={close}
              size="small"
              variant="transparent"
            >
              <Icon name="close" />
            </IconButton>
          )}
        </div>
        <div className={slots.body()} ref={bodyRef}>
          {description && (
            <p className={slots.description()} id={descriptionId}>
              {description}
            </p>
          )}
          {children}
        </div>
        {footerContent && (
          <div
            className={slots.footer()}
            // hazard: @types/react 18 does not type `inert`; the attribute is
            // set on the node so the footer ignores clicks while loading.
            ref={node => {
              node?.toggleAttribute('inert', loading)
            }}
          >
            {footerContent}
          </div>
        )}
        {loading && (
          <span className="sr-only" role="status">
            Processando…
          </span>
        )}
      </div>
    </div>
  )
}
