import { tv, VariantProps } from 'tailwind-variants'

const badge = tv({
  base: 'px-1 text-xs font-medium rounded-sm',
  variants: {
    variant: {
      neutral: [
        'border border-border-neutral-primary',
        'bg-background-surface-secondary text-text-neutral-secondary'
      ],
      attention:
        'py-px bg-background-fill-feedback-attention-quaternary text-background-fill-feedback-attention-primary',
      negative:
        'py-px bg-background-fill-feedback-negative-quaternary text-background-fill-feedback-negative-primary',
      positive:
        'py-px bg-background-fill-feedback-positive-quaternary text-background-fill-feedback-positive-primary'
    }
  },
  defaultVariants: {
    variant: 'neutral'
  }
})

export type BadgeProps = VariantProps<typeof badge> & {
  children?: React.ReactNode
}

export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => (
  <span className={badge({ variant })}>{children}</span>
)
