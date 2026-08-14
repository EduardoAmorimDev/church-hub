'use client'

import { useId, useRef } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { tv } from '@church/ui/lib/tailwind-variants'
import { focusableIn, useModalLayer } from '@church/ui/utils'
import { DrawerProps } from './Drawer.types'

const drawer = tv({
  slots: {
    scrim: 'fixed inset-0 z-40 bg-scrim',
    panel: [
      'flex w-drawer flex-col overflow-hidden rounded-3xl',
      'bg-surface text-primary shadow-elevation-high-left'
    ],
    header: 'flex items-center gap-3 px-6 pt-6 pb-3',
    titles: 'flex min-w-0 flex-1 flex-col',
    title: 'm-0 text-size-75 font-semibold',
    description: 'm-0 text-size-50 leading-5 font-normal text-secondary',
    body: 'flex min-h-30 flex-1 flex-col gap-4 overflow-auto p-6',
    footer: 'flex items-center gap-2.5 p-6'
  },
  variants: {
    mode: {
      modal: {
        panel: 'fixed top-6 right-6 bottom-6 z-41 max-w-drawer-modal'
      },
      inline: { panel: 'max-h-full max-w-full' }
    },
    divider: {
      true: {
        header: 'border-b border-default',
        footer: 'border-t border-default'
      },
      false: {}
    }
  },
  defaultVariants: { divider: true, mode: 'modal' }
})

export const Drawer = ({
  children,
  className,
  closeLabel = 'Fechar',
  description,
  divider = true,
  footer,
  headerActions,
  mode = 'modal',
  onBack,
  onClose,
  open = true,
  title
}: DrawerProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const modal = mode === 'modal'

  const layer = useModalLayer(open && modal, {
    ref: panelRef,
    onEscape: () => onClose?.(),
    initialFocus: panel => focusableIn(panel)[0]
  })

  if (!open) return null

  const slots = drawer({ divider, mode })
  const panel = (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal={modal ? 'true' : undefined}
      className={slots.panel({ className })}
      onKeyDown={modal ? layer.onKeyDown : undefined}
      ref={panelRef}
      role={modal ? 'dialog' : 'region'}
      tabIndex={-1}
    >
      <div className={slots.header()}>
        {onBack && (
          <IconButton
            aria-label="Voltar"
            color="neutral"
            onClick={onBack}
            size="small"
            variant="transparent"
          >
            <Icon name="arrow_back" />
          </IconButton>
        )}
        <div className={slots.titles()}>
          <h2 className={slots.title()} id={titleId}>
            {title}
          </h2>
          {description && (
            <p className={slots.description()} id={descriptionId}>
              {description}
            </p>
          )}
        </div>
        {headerActions}
        {onClose && (
          <IconButton
            aria-label={closeLabel}
            color="neutral"
            onClick={onClose}
            size="small"
            variant="transparent"
          >
            <Icon name="close" />
          </IconButton>
        )}
      </div>
      {/* why: a focusable, named scroll area keeps the body reachable by
          keyboard; `group` lets the name apply (a bare div cannot be named). */}
      <div
        aria-label="Conteúdo"
        className={slots.body()}
        role="group"
        tabIndex={0}
      >
        {children}
      </div>
      {footer && <div className={slots.footer()}>{footer}</div>}
    </div>
  )

  if (!modal) return panel

  return (
    <>
      <div aria-hidden="true" className={slots.scrim()} onClick={onClose} />
      {panel}
    </>
  )
}
