import { Decorator } from '@storybook/nextjs'
import { Noto_Sans, Oswald } from 'next/font/google'
import { useEffect } from 'react'
import { ThemeEnum } from '../models/enums'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans'
})

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald'
})

export const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals?.theme ?? ThemeEnum.LIGHT

  useEffect(() => {
    const html = document.documentElement

    html.className = ''
    html.classList.add(notoSans.variable, oswald.variable)
    html.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const body = document.body
    const backgroundToken = 'bg-background-surface-primary'

    if (body.classList.contains(backgroundToken)) return
    body.classList.add(backgroundToken)
  }, [])

  return <>{Story()}</>
}
