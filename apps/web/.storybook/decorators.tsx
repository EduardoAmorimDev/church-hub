import { Decorator } from '@storybook/nextjs'
import { AccentColorsEnum, ThemesEnum } from '../models/enums'
import { useEffect } from 'react'

export const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals?.theme ?? ThemesEnum.LIGHT
  const color = context.globals?.color ?? AccentColorsEnum.BLUE

  useEffect(() => {
    const html = document.documentElement

    html.className = ''
    html.classList.add(theme, color || '')
  }, [theme, color])

  useEffect(() => {
    const body = document.body
    const backgroundToken = 'bg-background-surface-primary'

    if (body.classList.contains(backgroundToken)) return
    body.classList.add(backgroundToken)
  }, [])

  return <>{Story()}</>
}
