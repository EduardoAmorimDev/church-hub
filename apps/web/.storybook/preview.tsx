import type { Preview } from '@storybook/nextjs'
import 'material-symbols'
import '../app/styles.css'
import '../models/enums'
import { ThemeDecorator } from './decorators'
import { CustomDocsContainer } from './containers'
import { AccentColorEnum, ThemeEnum } from '../models/enums'

const preview: Preview = {
  initialGlobals: {
    theme: ThemeEnum.LIGHT,
    color: AccentColorEnum.BLUE
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
    },
    color: {
      name: 'Color',
      description: 'Accent color',
      toolbar: {
        icon: 'paintbrush',
        items: Object.values(AccentColorEnum),
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
  decorators: [ThemeDecorator]
}

export default preview
