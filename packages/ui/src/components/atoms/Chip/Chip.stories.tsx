import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { Icon } from '../Icon'
import { Chip, ChipProps } from './Chip'

export default {
  title: 'atoms/Chip',
  component: Chip,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13596-6864&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Chip` component' } }
  },
  args: {
    children: 'Todos',
    disabled: false
  },
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'When defined the chip is a toggle and exposes aria-pressed'
    },
    active: {
      control: 'boolean',
      description: 'Visual Active state, without toggle semantics'
    },
    disabled: { control: 'boolean' },
    startIcon: {
      control: false,
      description: 'Optional 16px icon before the label',
      table: { type: { summary: 'ReactElement<IconProps>' } }
    },
    endIcon: {
      control: false,
      description:
        'Optional 16px icon after the label; it does not remove the chip',
      table: { type: { summary: 'ReactElement<IconProps>' } }
    }
  }
} as Meta<ChipProps>

export const Enabled: StoryObj<ChipProps> = {}

export const Active: StoryObj<ChipProps> = { args: { active: true } }

export const Disabled: StoryObj<ChipProps> = { args: { disabled: true } }

export const WithIcons: StoryObj<ChipProps> = {
  args: {
    endIcon: <Icon name="expand_more" />,
    startIcon: <Icon name="filter_list" />
  }
}

const FILTERS = ['Todos', 'Membros', 'Visitantes']

export const ExclusiveGroup: StoryObj<ChipProps> = {
  render: function Render() {
    const [current, setCurrent] = useState(FILTERS[0])
    return (
      <div aria-label="Filtrar pessoas" className="flex gap-2" role="group">
        {FILTERS.map(filter => (
          <Chip
            key={filter}
            onClick={() => setCurrent(filter)}
            selected={current === filter}
          >
            {filter}
          </Chip>
        ))}
      </div>
    )
  }
}
