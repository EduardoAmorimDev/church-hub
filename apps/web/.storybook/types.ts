import { themes } from 'storybook/theming'
import { AccentColorsEnum, ThemesEnum } from '../models/enums'
import type { DocsContainerProps } from '@storybook/addon-docs/blocks'

export type ThemeKey = keyof typeof themes

export type DecoratorProps = {
  theme: ThemeKey
  children: React.ReactNode
  color?: AccentColorsEnum
}

export type ExtendedDocsContainerProps = DocsContainerProps & {
  children: React.ReactNode
  context: DocsContainerProps['context'] & {
    store: {
      userGlobals: {
        globals: {
          theme?: ThemesEnum
          color?: AccentColorsEnum
        }
      }
    }
  }
}
