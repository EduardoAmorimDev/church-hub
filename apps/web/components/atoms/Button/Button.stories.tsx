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
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13352-328&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Button` component' } }
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
        type: { summary: colors.join(' | ') },
        defaultValue: { summary: 'neutral' }
      },
      control: 'select',
      options: colors
    },
    disabled: {
      description: 'If true, the button will be disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      },
      control: 'boolean'
    },
    size: {
      description: 'The size of the button',
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      },
      control: 'select',
      options: sizes
    },
    variant: {
      description: 'The variant of the button',
      table: {
        type: { summary: variants.join(' | ') },
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

export const IconButton: Story = {
  args: {
    icon: <Icon name="brightness_1" />
  },
  render: args => (
    <div className="flex items-center gap-4">
      <Button {...args} size="small" />
      <Button {...args} size="medium" />
      <Button {...args} size="large" />
    </div>
  )
}
