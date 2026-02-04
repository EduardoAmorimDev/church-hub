import { themes } from 'storybook/theming'
import { ExtendedDocsContainerProps } from './types'
import { ThemesEnum } from '../models/enums'
import { DocsContainer } from '@storybook/addon-docs/blocks'

export const CustomDocsContainer = ({
  context,
  children
}: ExtendedDocsContainerProps) => {
  const currentTheme =
    context.store.userGlobals.globals.theme ?? ThemesEnum.LIGHT
  const theme = themes[currentTheme] ?? themes.light

  return (
    <DocsContainer context={context} theme={theme}>
      {children}
    </DocsContainer>
  )
}
