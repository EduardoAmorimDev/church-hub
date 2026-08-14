import type { Meta, StoryObj } from '@storybook/nextjs'
import { CountBadge, CountBadgeProps } from './CountBadge'

export default {
  title: 'atoms/CountBadge',
  component: CountBadge,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `CountBadge` (the legacy Badge used by the Nav item count). The Figma node the artifact cites (13354:6056) does not open, so this story has no design link.'
      }
    }
  },
  args: {
    count: 12,
    max: 99
  },
  argTypes: {
    count: { control: 'number', description: 'The number to show' },
    max: {
      control: 'number',
      description: 'Above it the badge shows `max+`',
      table: { defaultValue: { summary: '99' } }
    },
    label: {
      control: 'text',
      description: 'Replaces the default "N novos" read by assistive technology'
    }
  }
} as Meta<CountBadgeProps>

export const Default: StoryObj<CountBadgeProps> = {}

export const OverMax: StoryObj<CountBadgeProps> = {
  args: { count: 150 }
}
