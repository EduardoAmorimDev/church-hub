import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'

import { Button, ButtonProps } from './Button'
import { Icon } from '../Icon'

const colors: Array<ButtonProps['color']> = [
  'destructive',
  'neutral',
  'positive'
]
const iconPositions: Array<ButtonProps['iconPosition']> = [
  'start',
  'end',
  'both'
]
const sizes: Array<ButtonProps['size']> = ['large', 'medium', 'small']
const variants: Array<ButtonProps['variant']> = [
  'filled',
  'ghost',
  'transparent'
]

export default {
  title: 'atoms/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13352-328&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Button` component' } }
  },
  args: {
    children: 'Button Text',
    icon: <Icon name="brightness_1" />
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the button',
      table: {
        type: { summary: 'ReactNode | string' }
      }
    },
    color: {
      control: 'select',
      description: 'The color of the button',
      options: colors,
      table: {
        type: { summary: colors.join('|') },
        defaultValue: { summary: 'neutral' }
      }
    },
    icon: {
      description:
        'An optional icon to be rendered inside the button. The size of the icon will be automatically adjusted based on the button size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    iconPosition: {
      control: 'select',
      description: 'The position of the icon inside the button',
      options: iconPositions,
      table: {
        type: { summary: iconPositions.join(' | ') },
        defaultValue: { summary: 'start' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the button:',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    variant: {
      control: 'select',
      description: 'The variant of the button',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'filled' }
      }
    }
  }
} as Meta<ButtonProps>

export const Default: StoryObj<ButtonProps> = {}

export const IconButton: StoryFn = () => (
  <div className="flex items-center gap-4">
    {['small', 'medium', 'large'].map(size => (
      <Button
        key={size}
        icon={<Icon name="brightness_1" />}
        size={size as ButtonProps['size']}
      />
    ))}
  </div>
)
