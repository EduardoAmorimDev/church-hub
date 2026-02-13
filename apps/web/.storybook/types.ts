import { themes } from 'storybook/theming'
import type { DocsContainerProps } from '@storybook/addon-docs/blocks'
import { AccentColorEnum, ThemeEnum } from '../models/enums'

export type ThemeKey = keyof typeof themes

export type DecoratorProps = {
  theme: ThemeKey
  children: React.ReactNode
  color?: AccentColorEnum
}

export type ExtendedDocsContainerProps = DocsContainerProps & {
  children: React.ReactNode
  context: DocsContainerProps['context'] & {
    store: {
      userGlobals: {
        globals: {
          theme?: ThemeEnum
          color?: AccentColorEnum
        }
      }
    }
  }
}
