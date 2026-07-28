import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from '../Icon'
import { Button, ButtonProps } from './Button'
import { intentionColors, sizes, variants } from '../data'

export default {
  title: 'atoms/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13352-328&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Button` component' } }
  },
  args: {
    children: 'Button Text',
    endIcon: <Icon name="brightness_1" />,
    startIcon: <Icon name="brightness_1" />
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the button',
      table: {
        type: { summary: 'ReactNode | string' }
      }
    },
    color: {
      control: 'select',
      description: 'The color of the button',
      options: intentionColors,
      table: {
        type: { summary: intentionColors.join('|') },
        defaultValue: { summary: 'neutral' }
      }
    },
    endIcon: {
      description:
        'An optional icon to be rendered at the end of the button. The size of the icon will be automatically adjusted based on the button size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    },
    startIcon: {
      description:
        'An optional icon to be rendered at the start of the button. The size of the icon will be automatically adjusted based on the button size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    },
    size: {
      control: 'select',
      description: 'The size of the button:',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    variant: {
      control: 'select',
      description: 'The variant of the button',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'filled' }
      }
    }
  }
} as Meta<ButtonProps>

export const Default: StoryObj<ButtonProps> = {}
