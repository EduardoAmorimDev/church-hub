import type { Meta, StoryObj } from '@storybook/nextjs'
import { Badge } from './Badge'
import { variants } from './data'

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13354-6107&m=dev'
    },
    docs: { description: { component: 'The Lamb Badge component' } }
  },
  argTypes: {
    children: {
      description: 'the badge text',
      table: { type: { summary: 'string' } },
      control: 'text'
    },
    variant: {
      description: 'Badge variant',
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'Neutral' }
      },
      control: 'select',
      options: variants
    }
  },
  args: {
    children: 'Label',
    variant: 'neutral'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral: Story = {}
