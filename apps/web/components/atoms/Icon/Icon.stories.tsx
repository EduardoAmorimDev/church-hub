import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from './Icon'
import { IconNames } from './data'

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    docs: { description: { component: 'The Lamb `Icon` component' } }
  },
  argTypes: {
    name: {
      description: 'The name of the material symbol',
      table: { type: { summary: 'MaterialSymbol' } },
      control: 'select',
      options: IconNames
    },
    fill: {
      description: 'Fill style of the icon',
      table: { type: { summary: '0 | 1' }, defaultValue: { summary: '0' } },
      control: 'select',
      options: [0, 1]
    },
    grade: {
      description: 'Grade of the icon',
      table: {
        type: { summary: '-25 | 0 | 200' },
        defaultValue: { summary: '0' }
      },
      control: 'select',
      options: [-25, 0, 200]
    },
    size: {
      description: 'Size of the icon',
      table: { type: { summary: 'number' }, defaultValue: { summary: '20' } },
      control: 'number'
    },
    variant: {
      description: 'Variant of the icon',
      table: {
        type: { summary: 'outlined | rounded | sharp' },
        defaultValue: { summary: 'outlined' }
      },
      control: 'select',
      options: ['outlined', 'rounded', 'sharp']
    },
    weight: {
      description: 'Weight of the icon',
      table: {
        type: { summary: '100 | 200 | 300 | 400 | 500 | 600 | 700' },
        defaultValue: { summary: '400' }
      },
      control: 'select',
      options: [100, 200, 300, 400, 500, 600, 700]
    }
  },
  args: {
    name: 'brightness_1',
    fill: 0,
    grade: 0,
    size: 20,
    variant: 'outlined',
    weight: 400
  },
  tags: ['autodocs']
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'text-text-neutral-primary'
  }
}
