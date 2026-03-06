import type { Meta, StoryObj } from '@storybook/nextjs'

import { Badge, BadgeProps } from './Badge'

const colors = [
  'neutral',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'indigo',
  'purple',
  'pink'
] as const

export default {
  title: 'Atoms/Badge',
  component: Badge,
  args: {
    children: 'Label',
    color: 'neutral',
    type: 'high'
  },
  argTypes: {
    color: {
      control: 'select',
      options: colors
    },
    type: {
      control: 'select',
      options: ['low', 'high']
    }
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13354-6107&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Badge` component' } }
  },
  tags: ['autodocs']
} as Meta<BadgeProps>

export const Default: StoryObj<BadgeProps> = {}

export const Low: StoryObj<BadgeProps> = {
  args: {
    type: 'low'
  }
}
