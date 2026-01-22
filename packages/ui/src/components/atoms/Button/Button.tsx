import { tv } from 'tailwind-variants'

type ButtonProps = {
  label?: string
  onPress?: () => void
  children?: React.ReactNode
}

const button = tv({
  base: '',
  variants: {
    color: {
      accent: '',
      positive: '',
      neutral: '',
      negative: ''
    },
    size: {
      small: '',
      medium: '',
      large: ''
    },
    variant: {
      primary: '',
      secondary: '',
      tertiary: ''
    }
  },
  compoundVariants: [
    {
      color: 'accent',
      variant: 'primary',
      className: 'bg-background-fill-accent-primary'
    },
    {
      color: 'accent',
      variant: 'secondary',
      className: 'bg-background-fill-accent-quaternary'
    },
    {
      color: 'accent',
      variant: 'tertiary',
      className: 'bg-transparent'
    }
  ]
})

export const Button = (props: ButtonProps) => {
  return (
    <button
      className="bg-accent-light-red-100 m-10 border-8 border-amber-600 p-8"
      {...props}
    />
  )
}
