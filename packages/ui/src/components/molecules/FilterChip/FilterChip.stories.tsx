import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { FilterChip, FilterChipProps } from './FilterChip'

export default {
  title: 'molecules/FilterChip',
  component: FilterChip,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `FilterChip`: an applied filter (removable) or a quick filter (toggle). It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  args: {
    disabled: false,
    label: 'Rede',
    value: 'Jovens'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['removable', 'toggle'],
      description: 'Omitted: removable when onRemove is given, toggle otherwise'
    },
    iconName: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
} as Meta<FilterChipProps>

export const Removable: StoryObj<FilterChipProps> = {
  args: { onRemove: () => undefined }
}

export const Editable: StoryObj<FilterChipProps> = {
  args: { onClick: () => undefined, onRemove: () => undefined }
}

export const Disabled: StoryObj<FilterChipProps> = {
  args: { disabled: true, onRemove: () => undefined }
}

export const Toggle: StoryObj<FilterChipProps> = {
  args: { iconName: 'group', label: 'Membros', value: undefined },
  render: function Render(args) {
    const [selected, setSelected] = useState(false)
    return (
      <FilterChip
        {...args}
        onClick={() => setSelected(current => !current)}
        selected={selected}
      />
    )
  }
}
