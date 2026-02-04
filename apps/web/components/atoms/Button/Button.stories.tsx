import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

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
    disabled: {
      description: 'If true, the file uploader will be disabled',
      table: { type: { summary: 'boolean' } },
      control: 'boolean'
    },
    color: {
      description: 'The color of the button',
      table: { type: { summary: 'string' } },
      control: 'select',
      options: colors
    },
    size: {
      description: 'The size of the button',
      table: { type: { summary: 'string' } },
      control: 'select',
      options: sizes
    },
    variant: {
      description: 'The variant of the button',
      table: { type: { summary: 'string' } },
      control: 'select',
      options: variants
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
    color: 'accent'
  }
}
