import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { tv, type VariantProps } from '@church/ui/lib/tailwind-variants'

const typography = tv({
  base: '',
  variants: {
    // invariant: Display is Oswald 700; every other family is Inter.
    // display-small (d3) sets a 30px line, unlike headline-large's 28.
    variant: {
      d1: 'font-oswald font-bold uppercase text-size-500',
      d2: 'font-oswald font-bold uppercase text-size-400',
      d3: 'font-oswald font-bold uppercase text-size-300 leading-7.5',

      h1: 'font-sans font-semibold text-size-400',
      h2: 'font-sans font-semibold text-size-300',
      h3: 'font-sans font-semibold text-size-200',
      h4: 'font-sans font-semibold text-size-75',
      h5: 'font-sans font-semibold text-size-50',

      f1: 'font-sans font-medium text-size-100',
      f2: 'font-sans font-medium text-size-75',
      f3: 'font-sans font-medium text-size-50',
      f4: 'font-sans font-medium text-size-25',

      p0: 'font-sans font-normal text-size-100',
      p1: 'font-sans font-normal text-size-75',
      p2: 'font-sans font-normal text-size-50',
      p3: 'font-sans font-normal text-size-25'
    }
  },
  defaultVariants: {
    variant: 'p1'
  }
})

type TypographyVariant = NonNullable<VariantProps<typeof typography>['variant']>

export const tagsByVariant: Record<TypographyVariant, ElementType> = {
  d1: 'span',
  d2: 'span',
  d3: 'span',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  f1: 'span',
  f2: 'span',
  f3: 'span',
  f4: 'span',
  p0: 'p',
  p1: 'p',
  p2: 'p',
  p3: 'p'
}

type TypographyOwnProps<T extends ElementType> = {
  variant?: TypographyVariant
  as?: T
  className?: string
  children?: ReactNode
}

export type TypographyProps<T extends ElementType = 'p'> =
  TypographyOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof TypographyOwnProps<T>>

export function Typography<T extends ElementType = 'p'>({
  variant = 'p1',
  as,
  className,
  children,
  ...props
}: TypographyProps<T>) {
  const Tag = (as ?? tagsByVariant[variant]) as ElementType

  return (
    <Tag className={typography({ variant, className })} {...props}>
      {children}
    </Tag>
  )
}
