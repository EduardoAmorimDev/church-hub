import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { View } from 'react-native'

import { Button } from './Button'

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
  decorators: [
    (Story: any) => (
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Story />
      </View>
    )
  ],
  argTypes: {},
  args: {},
  tags: ['autodocs']
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'Button'
  }
}
