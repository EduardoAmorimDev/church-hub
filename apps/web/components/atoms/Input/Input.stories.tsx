import type { Meta, StoryObj } from '@storybook/nextjs'

import { Input } from './Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Doh7KjbYN0XDwDixZ7wy2v/%5BDS%5D-Components?node-id=7349-1871'
    },
    docs: { description: { component: 'The Lamb `Input` component' } }
  },
  argTypes: {},
  args: {}
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
