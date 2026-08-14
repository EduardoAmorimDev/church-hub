'use client'

import { FocusEvent, ReactNode } from 'react'
import {
  Id,
  ToastContainer as ToastfyContainer,
  ToastContentProps,
  toast as toastify,
  UpdateOptions
} from 'react-toastify'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { Icon } from '@church/ui/atoms/Icon'
import { Typography } from '@church/ui/atoms/Typography'
import { TOAST_BOX_CLASSES, TOAST_TYPE_CLASSES } from './data'

export type ToastProps = {
  id?: string
  title: string
  action?: ReactNode
  description?: ReactNode
  toastProps?: Pick<ToastContentProps, 'closeToast'> & { toastId?: Id }
  variant?: 'error' | 'info' | 'success' | 'warning'
}

export const Toast = ({
  action,
  description,
  title,
  toastProps
}: ToastProps) => {
  const toastId = toastProps?.toastId

  // why: react-toastify pauses on hover only; Lamb also pauses while focus is
  // inside the toast, so a keyboard user can reach its action in time.
  const pause = () => {
    if (toastId != null) toastify.pause({ id: toastId })
  }
  const play = (event: FocusEvent<HTMLDivElement>) => {
    if (toastId == null) return
    if (!event.currentTarget.contains(event.relatedTarget)) {
      toastify.play({ id: toastId })
    }
  }

  return (
    <div
      className="flex w-full flex-col items-start gap-2"
      onBlur={play}
      onFocus={pause}
    >
      <div className="flex w-full items-start gap-2">
        <Typography
          as="p"
          variant="h5"
          className="m-0 flex-1 leading-5 text-current"
        >
          {title}
        </Typography>
        <button
          aria-label="Fechar notificação"
          className={[
            '-mt-1.5 -mr-1.5 inline-flex size-8 shrink-0 items-center justify-center',
            'hover:bg-hover rounded-lg text-current transition-colors',
            'focus-visible:outline-current'
          ].join(' ')}
          onClick={() => toastProps?.closeToast()}
          type="button"
        >
          <Icon className="text-current" name="close" size="medium" />
        </button>
      </div>
      {description != null && description !== '' && (
        <Typography variant="p3" className="m-0 text-current">
          {description}
        </Typography>
      )}
      {action}
    </div>
  )
}

type ToastParams = Omit<ToastProps, 'variant'>

// invariant: only an error interrupts the screen reader (`alert`); the other
// variants are announced politely (`status`).
export const toast = {
  info: ({ id: toastId, ...props }: ToastParams) =>
    toastify.info(<Toast variant="info" {...props} />, {
      role: 'status',
      toastId
    }),
  success: ({ id: toastId, ...props }: ToastParams) =>
    toastify.success(<Toast variant="success" {...props} />, {
      role: 'status',
      toastId
    }),
  warning: ({ id: toastId, ...props }: ToastParams) =>
    toastify.warn(<Toast variant="warning" {...props} />, {
      role: 'status',
      toastId
    }),
  error: ({ id: toastId, ...props }: ToastParams) =>
    toastify.error(<Toast variant="error" {...props} />, {
      role: 'alert',
      toastId
    }),

  dismiss: (toastId?: string) => toastify.dismiss(toastId),
  isActive: (toastId: string) => toastify.isActive(toastId),
  update: (toastId: string, options?: UpdateOptions) =>
    toastify.update(toastId, options)
}

export const ToastContainer = () => (
  <ToastfyContainer
    aria-label="Notificações"
    autoClose={6000}
    className="right-6! bottom-6! gap-2"
    closeButton={false}
    closeOnClick={false}
    hideProgressBar
    icon={false}
    pauseOnHover
    position="bottom-right"
    toastClassName={context =>
      twMerge(
        context?.defaultClassName,
        TOAST_BOX_CLASSES,
        TOAST_TYPE_CLASSES[context?.type ?? 'default']
      )
    }
  />
)
