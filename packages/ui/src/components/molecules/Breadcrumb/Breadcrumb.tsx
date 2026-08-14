import { ComponentProps, MouseEventHandler } from 'react'
import { twMerge } from '@church/ui/lib/tailwind-merge'

export type BreadcrumbItem = {
  label: string
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export type BreadcrumbProps = Omit<
  ComponentProps<'nav'>,
  'aria-label' | 'children'
> & {
  /** invariant: ordered from the root to the current page, which is last. */
  items: BreadcrumbItem[]
  /** why: names the landmark; Lamb defaults it to "Trilha de navegação". */
  label?: string
}

export const Breadcrumb = ({
  className,
  items,
  label = 'Trilha de navegação',
  ...props
}: BreadcrumbProps) => (
  <nav {...props} aria-label={label} className={className}>
    <ol className="text-size-50 m-0 flex list-none flex-wrap items-center gap-2 p-0 font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <li
            className="text-secondary inline-flex items-center gap-2"
            key={`${item.label}-${index}`}
          >
            {isLast ? (
              <span aria-current="page" className="text-primary">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                className={twMerge(
                  'text-secondary rounded-sm no-underline',
                  'hover:text-primary hover:underline'
                )}
                href={item.href}
                onClick={item.onClick}
              >
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && (
              <span aria-hidden="true" className="text-secondary">
                /
              </span>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)
