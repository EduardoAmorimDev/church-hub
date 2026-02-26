import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button, ButtonProps } from './Button'
import { Icon } from '../Icon'

const colors: Array<ButtonProps['color']> = [
  'destructive',
  'neutral',
  'positive'
]
const sizes: Array<ButtonProps['size']> = ['large', 'medium', 'small']
const variants: Array<ButtonProps['variant']> = [
  'filled',
  'ghost',
  'transparent'
]

export default {
  title: 'Atoms/Button',
  component: Button,
  args: {
    children: 'Button text',
    color: 'neutral',
    size: 'large',
    variant: 'filled'
  },
  argTypes: {
    children: {
      control: false,
      description: 'The content of the button:',
      table: { type: { summary: 'ReactNode | string' } }
    },
    color: {
      control: 'select',
      description: 'The color of the button:',
      options: colors,
      table: { type: { summary: colors.join('|') } }
    },
    size: {
      control: 'select',
      description: 'The size of the button:',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') }
      }
    },
    variant: {
      control: 'select',
      description: 'The variant of the button',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') }
      }
    }
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13352-328&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Button` component' } }
  },
  tags: ['autodocs']
} as Meta<ButtonProps>

export const Default: StoryObj<ButtonProps> = {}

export const WithIcon: StoryObj<ButtonProps> = {
  args: {
    children: (
      <>
        Button text with Icon
        <Icon name="brightness_1" />
      </>
    )
  }
}

export const IconButton: StoryObj<ButtonProps> = {
  args: {
    children: (
      <>
        <Icon name="brightness_1" />
      </>
    ),
    icon: true
  }
}
