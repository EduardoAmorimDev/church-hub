import type { Meta, StoryObj } from '@storybook/nextjs'

import { accentColors, sizes } from '../data'
import { Badge, BadgeProps } from './Badge'
import { Icon } from '../Icon'

const variants = ['low', 'high']

export default {
  title: 'atoms/Badge',
  component: Badge,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13354-6107&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Badge` component' } }
  },
  args: {
    children: 'Label',
    color: 'neutral',
    size: 'medium',
    endIcon: <Icon name="brightness_1" />,
    startIcon: <Icon name="brightness_1" />
  },
  argTypes: {
    color: {
      control: 'select',
      description: 'The color of the badge',
      options: accentColors,
      table: {
        type: { summary: accentColors.join('|') },
        defaultValue: { summary: 'neutral' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the badge',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    endIcon: {
      description:
        'An optional icon to be rendered at the end of the badge. The size of the icon will be automatically adjusted based on the badge size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    },
    startIcon: {
      description:
        'An optional icon to be rendered at the start of the badge. The size of the icon will be automatically adjusted based on the badge size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    },
    variant: {
      description: 'An option variant wich defines the badge variant',
      control: 'select',
      options: variants,
      table: { summary: variants.join(','), default: 'high' }
    }
  }
} as Meta<BadgeProps>

export const Default: StoryObj<BadgeProps> = {}

export const Low: StoryObj<BadgeProps> = {
  args: {
    variant: 'low'
  }
}
