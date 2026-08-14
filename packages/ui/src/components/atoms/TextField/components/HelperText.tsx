import { ComponentProps } from 'react'
import { tv, VariantProps } from '@church/ui/lib/tailwind-variants'

const helperText = tv({
  base: 'text-size-50',
  variants: {
    state: {
      default: 'text-neutral-67',
      error: 'text-red-67',
      // Additive: `TextField`/`TextArea` never pass `state="success"` here
      // today (their own success feedback lives in the border/ring, not the
      // helper text — see their own `helperState`/state-mapping helpers),
      // so this variant is currently exercised only by `Checkbox`, which
      // does show green helper text for `state="success"` (spec.md FR-008).
      success: 'text-green-67'
    }
  },
  defaultVariants: {
    state: 'default'
  }
})

type HelperTextProps = ComponentProps<'span'> & VariantProps<typeof helperText>

export const HelperText = ({ className, state, ...props }: HelperTextProps) => (
  <span className={helperText({ className, state })} {...props}></span>
)
