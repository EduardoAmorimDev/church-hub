import { useId } from 'react'
import { tv } from '@church/ui/lib/tailwind-variants'
import { SectionProps } from './Section.types'

// invariant: spacing follows the artifact's `bundle.css` where Figma differs
// (actions and filters gap, description, paginator footer padding;
// lamb-fields-lists Unresolved 1).
const section = tv({
  slots: {
    root: 'flex min-w-0 flex-col rounded-2xl bg-surface',
    head: 'flex flex-col border-b border-default',
    top: 'flex flex-wrap items-start justify-between gap-4 p-4',
    title: 'm-0 text-size-200 font-semibold',
    description: 'm-0 mt-0.5 text-size-50 leading-5 font-normal text-secondary',
    actions: 'flex flex-wrap items-center gap-2',
    tools: 'flex flex-wrap items-center justify-between gap-4 px-4 pt-0 pb-4',
    search: 'shrink grow basis-60 max-w-77.25',
    filters: 'flex flex-wrap items-center gap-2',
    body: 'flex min-w-0 flex-col gap-2.5 p-4',
    footer: 'flex items-center gap-4 border-t border-default'
  },
  variants: {
    // invariant: with no visible top row, the tools row takes its top padding.
    topless: {
      true: { tools: 'pt-4' },
      false: {}
    },
    footerType: {
      button: { footer: 'p-4' },
      paginator: { footer: 'px-4 py-2' }
    }
  },
  defaultVariants: { footerType: 'button', topless: false }
})

const present = (node: unknown) => node != null && node !== false

export const Section = ({
  actions,
  children,
  className,
  description,
  filters,
  footer,
  footerType = 'button',
  headingLevel = 2,
  id,
  search,
  simple = false,
  title,
  titleHidden = false
}: SectionProps) => {
  const titleId = useId()
  const Heading = `h${headingLevel}` as const
  const topless = titleHidden && !present(description) && !present(actions)
  const slots = section({ footerType, topless })
  const heading = (
    <Heading className={titleHidden ? 'sr-only' : slots.title()} id={titleId}>
      {title}
    </Heading>
  )

  return (
    <section
      aria-labelledby={titleId}
      className={slots.root({ className })}
      id={id}
    >
      <div className={slots.head()}>
        {topless ? (
          heading
        ) : (
          <div className={slots.top()}>
            <div>
              {heading}
              {present(description) && (
                <p className={slots.description()}>{description}</p>
              )}
            </div>
            {present(actions) && (
              <div className={slots.actions()}>{actions}</div>
            )}
          </div>
        )}
        {!simple && (present(search) || present(filters)) && (
          <div className={slots.tools()}>
            <div className={slots.search()}>{search}</div>
            {present(filters) && (
              <div className={slots.filters()}>{filters}</div>
            )}
          </div>
        )}
      </div>
      <div className={slots.body()}>{children}</div>
      {present(footer) && (
        <div className={slots.footer()} data-type={footerType}>
          {footer}
        </div>
      )}
    </section>
  )
}
