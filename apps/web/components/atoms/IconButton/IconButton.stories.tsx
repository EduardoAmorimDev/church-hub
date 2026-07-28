import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from '../Icon'
import { IconButton, IconButtonProps } from './IconButton'
import { intentionColors, sizes, variants } from '../data'

export default {
  title: 'atoms/IconButton',
  component: IconButton,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13352-328&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `IconButton` component' } }
  },
  args: {
    children: <Icon name="brightness_1" />
  },
  argTypes: {
    children: {
      control: false,
      description: 'The icon of the icon button',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    color: {
      control: 'select',
      description: 'The color of the icon button',
      options: intentionColors,
      table: {
        type: { summary: intentionColors.join('|') },
        defaultValue: { summary: 'neutral' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the icon button',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    variant: {
      control: 'select',
      description: 'The variant of the icon button',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'filled' }
      }
    }
  }
} as Meta<IconButtonProps>

export const Default: StoryObj<IconButtonProps> = {}
