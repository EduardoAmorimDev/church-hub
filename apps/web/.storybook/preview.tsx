import type { Preview } from '@storybook/nextjs'
import 'material-symbols'
import '../app/styles.css'
import '../models/enums'
import { ThemeEnum } from '../models/enums'
import { CustomDocsContainer } from './containers'
import { ThemeDecorator } from './decorators'

const preview: Preview = {
  decorators: [ThemeDecorator],
  initialGlobals: {
    theme: ThemeEnum.LIGHT
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme',
      toolbar: {
        icon: 'sun',
        items: Object.values(ThemeEnum),
        dynamicTitle: true
      }
    }
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      },
      expanded: true
    },
    docs: {
      container: CustomDocsContainer
    },
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default preview
