import { Decorator } from '@storybook/nextjs'
import { useEffect } from 'react'
import { AccentColorEnum, ThemeEnum } from '../models/enums'

export const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals?.theme ?? ThemeEnum.LIGHT
  const color = context.globals?.color ?? AccentColorEnum.BLUE

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
