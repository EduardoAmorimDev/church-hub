import { tv, VariantProps } from 'tailwind-variants'

const badge = tv({
  base: 'px-1 text-size-100 font-medium rounded-full',
  variants: {
    color: {
      neutral: 'text-neutral-83 bg-neutral-00',
      red: 'text-neutral-00 bg-red-67',
      orange: 'text-neutral-00 bg-orange-50',
      yellow: 'text-neutral-00 bg-yellow-33',
      lime: 'text-neutral-00 bg-lime-33',
      green: 'text-neutral-00 bg-green-67',
      cyan: 'text-neutral-00 bg-cyan-67',
      blue: 'text-neutral-00 bg-blue-67',
      indigo: 'text-neutral-00 bg-indigo-67',
      purple: 'text-neutral-00 bg-purple-67',
      pink: 'text-neutral-00 bg-pink-67'
    },
    type: {
      low: '',
      high: ''
    }
  },
  compoundVariants: [
    {
      color: 'neutral',
      type: 'low',
      class: 'bg-neutral-alpha/10!'
    },
    {
      color: 'red',
      type: 'low',
      class: 'bg-red-alpha/20! text-red-67'
    },
    {
      color: 'orange',
      type: 'low',
      class: 'bg-orange-alpha/20! text-orange-50'
    },
    {
      color: 'yellow',
      type: 'low',
      class: 'bg-yellow-alpha/20! text-yellow-67'
    },
    {
      color: 'lime',
      type: 'low',
      class: 'bg-lime-alpha/20! text-lime-67'
    },
    {
      color: 'green',
      type: 'low',
      class: 'bg-green-alpha/20! text-green-83'
    },
    {
      color: 'cyan',
      type: 'low',
      class: 'bg-cyan-alpha/20! text-cyan-83'
    },
    {
      color: 'blue',
      type: 'low',
      class: 'bg-blue-alpha/20! text-blue-83'
    },
    {
      color: 'indigo',
      type: 'low',
      class: 'bg-indigo-alpha/20! text-indigo-67'
    },
    {
      color: 'purple',
      type: 'low',
      class: 'bg-purple-alpha/20! text-purple-67'
    },
    {
      color: 'pink',
      type: 'low',
      class: 'bg-pink-alpha/20! text-pink-67'
    }
  ],
  defaultVariants: {
    color: 'neutral',
    type: 'high'
  }
})

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badge>

export const Badge = ({ color, type, ...props }: BadgeProps) => {
  return <span className={badge({ color, type })} {...props} />
}
