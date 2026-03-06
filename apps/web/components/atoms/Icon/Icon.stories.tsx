import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon, IconProps } from './Icon'

export default {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    docs: { description: { component: 'The Lamb DS `Icon` component' } }
  },
  argTypes: {
    name: {
      control: false,
      description: 'The name of the material symbol',
      table: { type: { summary: 'MaterialSymbol' } }
    },
    fill: {
      control: 'select',
      description: 'Fill style of the icon',
      options: [0, 1],
      table: { type: { summary: '0 | 1' }, defaultValue: { summary: '0' } }
    },
    grade: {
      control: 'select',
      description: 'Grade of the icon',
      options: [-25, 0, 200],
      table: {
        type: { summary: '-25 | 0 | 200' },
        defaultValue: { summary: '0' }
      }
    },
    variant: {
      control: 'select',
      description: 'Variant of the icon',
      options: ['outlined', 'rounded', 'sharp'],
      table: {
        type: { summary: 'outlined | rounded | sharp' },
        defaultValue: { summary: 'outlined' }
      }
    },
    weight: {
      control: 'select',
      description: 'Weight of the icon',
      options: [100, 200, 300, 400, 500, 600, 700],
      table: {
        type: { summary: '100 | 200 | 300 | 400 | 500 | 600 | 700' },
        defaultValue: { summary: '400' }
      }
    }
  },
  args: {
    name: 'brightness_1',
    fill: 0,
    grade: 0,
    variant: 'outlined',
    weight: 400
  },
  tags: ['autodocs']
} as Meta<IconProps>

export const Default: StoryObj<IconProps> = {}
