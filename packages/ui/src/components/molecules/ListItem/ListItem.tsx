import { ComponentProps, MouseEventHandler, ReactNode } from 'react'
import { Icon } from '@church/ui/atoms/Icon'
import { tv } from '@church/ui/lib/tailwind-variants'

// hazard: the leading slot sizes and tints the default (outlined) Icon from
// outside, as Lamb's `.lamb-li-leading .lamb-icon`; other glyph sets keep
// their own size.
const listItem = tv({
  slots: {
    root: 'relative flex items-stretch',
    main: [
      'm-0 flex min-w-0 flex-1 items-center gap-3 rounded-lg border-0 px-4 py-2',
      'bg-transparent text-left text-primary no-underline',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring'
    ],
    leading: [
      'inline-flex shrink-0 items-center text-secondary',
      '[&_.material-symbols-outlined]:text-icon-24! [&_.material-symbols-outlined]:text-current'
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'truncate text-size-75 font-medium',
    subtitle: 'truncate text-size-50 font-normal text-secondary',
    trailing:
      'inline-flex shrink-0 items-center gap-2 text-size-50 font-normal text-secondary',
    chevron: 'shrink-0 text-secondary',
    action: 'inline-flex items-center pr-2'
  },
  variants: {
    density: {
      compact: { main: 'min-h-12', title: 'text-size-50 leading-5' },
      default: { main: 'min-h-16' },
      comfortable: { main: 'min-h-18' }
    },
    interactive: {
      true: {
        main: 'cursor-pointer hover:bg-hover active:bg-selected'
      },
      false: {}
    },
    selected: {
      true: { main: 'bg-selected' },
      false: {}
    },
    disabled: {
      true: {
        main: 'cursor-not-allowed bg-transparent text-disabled',
        subtitle: 'text-disabled'
      },
      false: {}
    },
    divider: {
      // invariant: inset 16px from the left, never under the list's last item.
      true: {
        root: [
          'not-last:after:absolute not-last:after:right-0 not-last:after:bottom-0 not-last:after:left-4',
          'not-last:after:h-0 not-last:after:border-b not-last:after:border-default'
        ]
      },
      false: {}
    }
  },
  defaultVariants: {
    density: 'default',
    disabled: false,
    divider: true,
    interactive: false,
    selected: false
  }
})

export type ListItemProps = Omit<ComponentProps<'li'>, 'title' | 'onClick'> & {
  title: ReactNode
  subtitle?: ReactNode
  /** why: an Avatar, Icon or Checkbox; icons are drawn at 24px. */
  leading?: ReactNode
  trailing?: ReactNode
  /** invariant: a secondary action beside the row, never inside its link. */
  action?: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  /** why: `label` makes the whole row toggle a Checkbox in `leading`. */
  as?: 'a' | 'button' | 'label' | 'div'
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  divider?: boolean
  density?: 'compact' | 'default' | 'comfortable'
  chevron?: boolean
}

export const ListItem = ({
  action,
  as,
  chevron,
  children,
  className,
  density = 'default',
  disabled = false,
  divider = true,
  href,
  interactive,
  leading,
  onClick,
  selected = false,
  subtitle,
  title,
  trailing,
  ...props
}: ListItemProps) => {
  const isInteractive =
    interactive ?? Boolean(href || onClick || as === 'label')
  const element = as ?? (isInteractive ? (href ? 'a' : 'button') : 'div')
  const showChevron = chevron ?? (isInteractive && element !== 'label')
  const slots = listItem({
    density,
    disabled,
    divider,
    interactive: isInteractive && !disabled,
    selected
  })
  const shared = {
    'aria-current': selected ? ('true' as const) : undefined,
    className: slots.main()
  }

  const body = (
    <>
      {leading != null && leading !== false && (
        <span className={slots.leading()}>{leading}</span>
      )}
      <span className={slots.content()}>
        <span className={slots.title()}>{title}</span>
        {subtitle != null && subtitle !== false && (
          <span className={slots.subtitle()}>{subtitle}</span>
        )}
        {children}
      </span>
      {trailing != null && trailing !== false && (
        <span className={slots.trailing()}>{trailing}</span>
      )}
      {showChevron && (
        <Icon className={slots.chevron()} name="chevron_right" size="medium" />
      )}
    </>
  )

  const main =
    element === 'a' ? (
      <a
        {...shared}
        aria-disabled={disabled ? 'true' : undefined}
        href={disabled ? undefined : href}
        onClick={disabled ? event => event.preventDefault() : onClick}
      >
        {body}
      </a>
    ) : element === 'button' ? (
      <button {...shared} disabled={disabled} onClick={onClick} type="button">
        {body}
      </button>
    ) : element === 'label' ? (
      <label {...shared}>{body}</label>
    ) : (
      <div {...shared}>{body}</div>
    )

  return (
    <li
      {...props}
      className={slots.root({ className })}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
    >
      {main}
      {action != null && action !== false && (
        <span className={slots.action()}>{action}</span>
      )}
    </li>
  )
}
