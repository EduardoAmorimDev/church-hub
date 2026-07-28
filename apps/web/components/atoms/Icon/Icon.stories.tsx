import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from './Icon'
import { IconProps } from './models'
import { sizes } from '../data'

const variants = ['outlined', 'rounded', 'sharp']

export default {
  title: 'atoms/Icon',
  component: Icon,
  parameters: {
    docs: { description: { component: 'The Lamb DS `Icon` component' } }
  },
  args: {
    name: 'brightness_1'
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
    responsive: {
      control: 'boolean',
      description: 'Whether the icon should be responsive',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    size: {
      control: 'select',
      description: 'Size of the icon',
      options: sizes,
      table: {
        type: { summary: sizes.join('|') },
        defaultValue: { summary: 'medium' }
      }
    },
    variant: {
      control: 'select',
      description: 'Variant of the icon',
      options: variants,
      table: {
        type: { summary: variants.join('|') },
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
  }
} as Meta<IconProps>

export const Default: StoryObj<IconProps> = {}
