import { themes } from 'storybook/theming'
import { ExtendedDocsContainerProps } from './types'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeEnum } from '../models/enums'

export const CustomDocsContainer = ({
  context,
  children
}: ExtendedDocsContainerProps) => {
  const currentTheme =
    context.store.userGlobals.globals.theme ?? ThemeEnum.LIGHT
  const theme = themes[currentTheme] ?? themes.light

  return (
    <DocsContainer context={context} theme={theme}>
      {children}
    </DocsContainer>
  )
}
