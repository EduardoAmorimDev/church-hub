import type { Meta, StoryObj } from '@storybook/nextjs'
import { Spinner, SpinnerProps } from './Spinner'

export default {
  title: 'atoms/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Spinner`. It has no Figma node: the Lamb artifact created it for Dialog and Toggle. It follows the surrounding font size and colour.'
      }
    }
  },
  args: {
    label: undefined
  },
  argTypes: {
    label: {
      control: 'text',
      description:
        'Accessible name; set only when nothing else announces the pending state'
    }
  }
} as Meta<SpinnerProps>

export const Default: StoryObj<SpinnerProps> = {
  render: args => (
    <span className="text-size-300 text-primary">
      <Spinner {...args} />
    </span>
  )
}

export const WithLabel: StoryObj<SpinnerProps> = {
  args: { label: 'Salvando…' },
  render: args => (
    <span className="text-size-75 text-secondary inline-flex items-center gap-2">
      <Spinner {...args} />
      Salvando…
    </span>
  )
}
