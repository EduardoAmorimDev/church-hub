import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from '../Icon'
import { Button } from './Button'
import { colors, sizes, variants } from './data'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Doh7KjbYN0XDwDixZ7wy2v/%5BDS%5D-Components?node-id=7349-1871'
    },
    docs: { description: { component: 'The Lamb `Button` component' } }
  },
  argTypes: {
    children: {
      description: 'The content of the button',
      table: { type: { summary: 'ReactNode' } },
      control: 'text'
    },
    color: {
      description: 'The color of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'neutral' }
      },
      control: 'select',
      options: colors
    },
    disabled: {
      description: 'If true, the file uploader will be disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      },
      control: 'boolean'
    },
    size: {
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' }
      },
      control: 'select',
      options: sizes
    },
    variant: {
      description: 'The variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' }
      },
      control: 'select',
      options: variants
    },
    endIcon: {
      description: 'The icon to display at the end of the button',
      table: { type: { summary: 'IconElement' } },
      control: false
    },
    startIcon: {
      description: 'The icon to display at the start of the button',
      table: { type: { summary: 'IconElement' } },
      control: false
    }
  },
  args: {
    size: 'medium',
    color: 'neutral',
    variant: 'primary',
    disabled: false
  },
  tags: ['autodocs']
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default Button',
    endIcon: <Icon name="brightness_1" />,
    startIcon: <Icon name="brightness_1" />
  }
}
