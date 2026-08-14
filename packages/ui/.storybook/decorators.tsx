import { Decorator } from '@storybook/nextjs'
import { Inter, Oswald } from 'next/font/google'
import { useEffect } from 'react'
import { ThemeEnum } from '../src/models/enums'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
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
    html.classList.add(inter.variable, oswald.variable)
    html.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const body = document.body
    const backgroundToken = 'bg-page'

    if (body.classList.contains(backgroundToken)) return
    body.classList.add(backgroundToken)
  }, [])

  return <>{Story()}</>
}
