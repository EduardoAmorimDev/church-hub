import Link from 'next/link'
import { chip } from '@church/ui/atoms/Chip'
import { tv } from '@church/ui/lib/tailwind-variants'
import { TabsProps } from './Tabs.types'

const tabs = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-2',
    // why: an unselected tab reads muted in the design; secondary is the
    // closest text token (there is no tertiary one).
    idle: 'text-secondary not-disabled:hover:bg-hover'
  }
})

// why: navigation between URLs, so links with `aria-current`, not the ARIA
// tab pattern, which drives panels on the same page.
export const Tabs = ({ className, items, label }: TabsProps) => {
  const slots = tabs()

  return (
    <nav aria-label={label} className={slots.root({ className })}>
      {items.map(item => (
        <Link
          aria-current={item.current ? 'page' : undefined}
          className={chip({
            className: item.current ? undefined : slots.idle(),
            highlighted: Boolean(item.current),
            size: 'small'
          })}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
