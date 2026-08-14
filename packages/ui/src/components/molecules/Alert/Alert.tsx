import { ComponentProps, ReactNode } from 'react'
import { Icon, IconName } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'

const alert = tv({
  slots: {
    root: 'flex w-full max-w-112 gap-3 rounded-10 border p-3 text-primary',
    icon: 'shrink-0',
    body: 'flex min-w-0 flex-1 flex-col gap-3',
    text: 'flex flex-col gap-1',
    title: 'm-0 text-size-50 leading-5 font-semibold',
    description: 'text-size-50 leading-5 font-normal text-primary',
    actions: 'flex flex-wrap gap-2',
    close: [
      '-mt-1.5 -mr-1.5 inline-flex size-8 shrink-0 items-center justify-center',
      'rounded-lg text-current transition-colors hover:bg-hover'
    ]
  },
  variants: {
    variant: {
      info: {
        root: 'border-default bg-hover',
        icon: 'text-primary',
        title: 'text-primary'
      },
      success: {
        root: 'border-green-alpha/40 bg-positive-subtle',
        icon: 'text-positive',
        title: 'text-positive'
      },
      warning: {
        root: 'border-yellow-alpha/40 bg-attention-subtle',
        icon: 'text-attention',
        title: 'text-attention'
      },
      error: {
        root: 'border-red-alpha/40 bg-danger-subtle',
        icon: 'text-danger',
        title: 'text-danger'
      }
    }
  },
  defaultVariants: { variant: 'success' }
})

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const VARIANT_ICON: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'report'
}

// why: the colour alone carries the status, so the title opens with the
// status word for assistive technology (Lamb `STATUS_WORD`).
const VARIANT_WORD: Record<AlertVariant, string> = {
  info: 'Informação',
  success: 'Sucesso',
  warning: 'Atenção',
  error: 'Erro'
}

export type AlertProps = Omit<ComponentProps<'div'>, 'title' | 'role'> & {
  variant?: AlertVariant
  title: ReactNode
  iconName?: IconName
  actions?: ReactNode
  onClose?: () => void
  closeLabel?: string
  /** invariant: announces the alert: `role="alert"` for `error`,
   * `role="status"` otherwise; without it the alert has no role. */
  live?: boolean
}

export const Alert = ({
  actions,
  children,
  className,
  closeLabel = 'Fechar aviso',
  iconName,
  live = false,
  onClose,
  title,
  variant = 'success',
  ...props
}: AlertProps) => {
  const slots = alert({ variant })
  const role = live ? (variant === 'error' ? 'alert' : 'status') : undefined

  return (
    <div {...props} className={slots.root({ className })} role={role}>
      <Icon
        className={slots.icon()}
        fill={1}
        name={iconName ?? VARIANT_ICON[variant]}
        size="medium"
      />
      <div className={slots.body()}>
        <div className={slots.text()}>
          <p className={slots.title()}>
            <span className="sr-only">{VARIANT_WORD[variant]}: </span>
            {title}
          </p>
          {children != null && children !== false && (
            <div className={slots.description()}>{children}</div>
          )}
        </div>
        {actions != null && actions !== false && (
          <div className={slots.actions()}>{actions}</div>
        )}
      </div>
      {onClose && (
        <button
          aria-label={closeLabel}
          className={slots.close()}
          onClick={onClose}
          type="button"
        >
          <Icon className="text-current" name="close" size="medium" />
        </button>
      )}
    </div>
  )
}
