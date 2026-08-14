'use client'

import { ReactNode } from 'react'
import {
  ToastContainer as ToastfyContainer,
  ToastContentProps,
  toast as toastify,
  UpdateOptions,
  TypeOptions
} from 'react-toastify'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { Icon } from '@church/ui/atoms/Icon'
import { Typography } from '@church/ui/atoms/Typography'
import { TOAST_TYPE_CLASSES } from './data'

export type ToastProps = {
  id?: string
  title: string
  action?: ReactNode
  description?: ReactNode
  toastProps?: Pick<ToastContentProps, 'closeToast'>
  variant?: 'error' | 'info' | 'success' | 'warning'
}

export const Toast = ({
  action,
  description,
  title,
  toastProps
}: ToastProps) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <Typography as="span" variant="h5" className="text-neutral-00">
          {title}
        </Typography>
        <button
          aria-label="Fechar notificação"
          className="text-neutral-00 hover:text-neutral-17 transition-all"
          onClick={() => toastProps?.closeToast()}
        >
          <Icon name="close" size="small" />
        </button>
      </div>
      <Typography variant="p3" className="text-neutral-00 mb-2">
        {description}
      </Typography>
      {action}
    </div>
  )
}

type ToastParams = Omit<ToastProps, 'variant'>

export const toast = {
  info: ({ id: toastId, ...props }: ToastParams) =>
    toastify.info(<Toast variant="info" {...props} />, {
      toastId
    }),
  success: ({ id: toastId, ...props }: ToastParams) =>
    toastify.success(<Toast variant="success" {...props} />, {
      toastId
    }),
  warning: ({ id: toastId, ...props }: ToastParams) =>
    toastify.warn(<Toast variant="warning" {...props} />, {
      toastId
    }),
  error: ({ id: toastId, ...props }: ToastParams) =>
    toastify.error(<Toast variant="error" {...props} />, {
      toastId
    }),

  dismiss: (toastId?: string) => toastify.dismiss(toastId),
  isActive: (toastId: string) => toastify.isActive(toastId),
  update: (toastId: string, options?: UpdateOptions) =>
    toastify.update(toastId, options)
}

export const ToastContainer = () => (
  <ToastfyContainer
    autoClose={5000}
    closeButton={false}
    closeOnClick={false}
    icon={false}
    hideProgressBar
    toastClassName={context =>
      twMerge(
        'p-3! rounded-10!',
        context?.defaultClassName,
        TOAST_TYPE_CLASSES[context?.type as TypeOptions]
      )
    }
  />
)
