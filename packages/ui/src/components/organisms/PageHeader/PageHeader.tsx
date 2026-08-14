import { Typography } from '@church/ui/atoms/Typography'
import { tv } from '@church/ui/lib/tailwind-variants'
import { Breadcrumb } from '@church/ui/molecules/Breadcrumb'
import { PageHeaderProps } from './PageHeader.types'

// why: Lamb pads the header 32px on the sides in Painel and 20px in App; App
// is the base, and `panel:` or an ancestor `[data-viewport]` switches it.
const pageHeader = tv({
  slots: {
    root: [
      'flex flex-col gap-6 px-5 pt-4 pb-3',
      'panel:not-in-data-[viewport=mobile]:px-8 in-data-[viewport=desktop]:px-8'
    ],
    row: 'flex flex-wrap items-end justify-between gap-4',
    titles: 'flex min-w-0 flex-col gap-1',
    title: 'm-0 text-size-300 font-semibold',
    greeting: 'm-0',
    description: 'm-0 text-size-50 leading-5 font-normal text-primary',
    actions: 'flex items-center gap-2',
    chips: 'flex flex-wrap gap-2'
  }
})

export const PageHeader = ({
  actions,
  breadcrumb,
  chips,
  description,
  greeting,
  title,
  type = 'primary'
}: PageHeaderProps) => {
  const slots = pageHeader()
  const primary = type === 'primary'

  return (
    <header className={slots.root()}>
      <div className={slots.row()}>
        <div className={slots.titles()}>
          {primary && breadcrumb && <Breadcrumb items={breadcrumb} />}
          {primary ? (
            <h1 className={slots.title()}>{title}</h1>
          ) : (
            <Typography as="h1" className={slots.greeting()} variant="d3">
              {greeting || title}
            </Typography>
          )}
          {description && <p className={slots.description()}>{description}</p>}
        </div>
        {actions && <div className={slots.actions()}>{actions}</div>}
      </div>
      {primary && chips && (
        <div
          aria-label="Filtros rápidos"
          className={slots.chips()}
          role="group"
        >
          {chips}
        </div>
      )}
    </header>
  )
}
