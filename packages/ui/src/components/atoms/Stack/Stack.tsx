import { ElementType, HTMLAttributes } from 'react'
import { APP_GAP, AUTO_GAP, PANEL_GAP, StackRelation, StackTier } from './data'
import { tv } from '@church/ui/lib/tailwind-variants'

const stack = tv({
  base: 'flex min-w-0',
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row items-center'
    },
    wrap: {
      true: '',
      false: 'flex-nowrap'
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }
  },
  compoundVariants: [
    { direction: 'horizontal', wrap: true, class: 'flex-wrap' }
  ]
})

export type StackProps = HTMLAttributes<HTMLElement> & {
  /** Size tier of the children; with mixed tiers, use the larger one. */
  tier?: StackTier
  /** Relation strength by the removal test: does B still read without A? */
  relation?: StackRelation
  /** `auto`: Painel from 960px, App below, or an ancestor `[data-viewport]`. */
  density?: 'auto' | 'panel' | 'app'
  direction?: 'vertical' | 'horizontal'
  /** App only: interactive primitives side by side get 12px instead of 8. */
  interactive?: boolean
  /** Painel only: `false` (groups without a surface) lifts block + weak to 24px. */
  surfaces?: boolean
  /** Horizontal only: `false` keeps the row on one line. */
  wrap?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  as?: ElementType
}

export const Stack = ({
  align,
  as: Component = 'div',
  className,
  density = 'auto',
  direction = 'vertical',
  interactive = false,
  justify,
  relation = 'weak',
  surfaces = true,
  tier = 'composite',
  wrap = true,
  ...props
}: StackProps) => {
  const cell = `${tier}-${relation}` as const
  const panelKey = cell === 'block-weak' && !surfaces ? 'block-weak-bare' : cell
  const appKey =
    cell === 'primitive-strong' && interactive
      ? 'primitive-strong-interactive'
      : cell
  const gap =
    density === 'panel'
      ? PANEL_GAP[panelKey]
      : density === 'app'
        ? APP_GAP[appKey]
        : AUTO_GAP[panelKey === cell ? appKey : panelKey]

  return (
    <Component
      {...props}
      className={stack({
        align,
        className: [gap, className],
        direction,
        justify,
        wrap
      })}
    />
  )
}
