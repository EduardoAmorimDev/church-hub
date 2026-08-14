import type { Meta, StoryObj } from '@storybook/nextjs'
import { StatCard, StatCardProps } from './StatCard'

export default {
  title: 'molecules/StatCard',
  component: StatCard,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13619-2134&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `StatCard`: a dashboard total, with optional trend, help and `SubInfo` breakdown. Numbers are formatted in pt-BR.'
      }
    }
  },
  args: {
    help: 'Pessoas com presença nos últimos 90 dias',
    iconName: 'group',
    label: 'Membros ativos',
    size: 'medium',
    subs: [
      { iconName: 'person_add', label: 'novos', value: 12 },
      { iconName: 'waving_hand', label: 'visitantes', value: 34 }
    ],
    trend: '+12 este mês',
    value: 1284
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
      table: { defaultValue: { summary: 'medium' } }
    },
    value: { control: 'text' },
    format: { control: 'object' },
    iconName: { control: 'text' }
  }
} as Meta<StatCardProps>

export const Default: StoryObj<StatCardProps> = {}

export const Small: StoryObj<StatCardProps> = {
  args: { size: 'small', subs: [] }
}

export const Currency: StoryObj<StatCardProps> = {
  args: {
    format: { currency: 'BRL', style: 'currency' },
    help: undefined,
    iconName: 'payments',
    label: 'Total de exemplo',
    subs: [],
    trend: undefined,
    value: 2115
  }
}

export const MissingValue: StoryObj<StatCardProps> = {
  args: { subs: [], trend: undefined, value: '—' }
}
