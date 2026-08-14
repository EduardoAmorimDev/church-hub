import { ComponentProps } from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

// why: the line is the `<hr>`'s single 1px border in `border-default`, so it
// keeps the semantic token in both themes; Lamb's vertical rule is visible.
const divider = tv({
  base: 'm-0 shrink-0 border-0 border-default',
  variants: {
    orientation: {
      horizontal: 'h-0 w-full border-t',
      vertical: 'min-h-4 w-0 self-stretch border-l'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
})

export type DividerProps = Omit<ComponentProps<'hr'>, 'children'> &
  VariantProps<typeof divider> & {
    /** invariant: `false` exposes a separator; keep it for groups with meaning. */
    decorative?: boolean
  }

export const Divider = ({
  className,
  decorative = true,
  orientation = 'horizontal',
  ...props
}: DividerProps) => (
  <hr
    {...props}
    aria-hidden={decorative ? true : undefined}
    aria-orientation={
      !decorative && orientation === 'vertical' ? 'vertical' : undefined
    }
    className={divider({ className, orientation })}
    role={decorative ? undefined : 'separator'}
  />
)
